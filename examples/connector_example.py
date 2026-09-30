"""
Custom Connector Example
=========================
This is an example of using the generic WrappedRun class to create Connectors.

We will use a simple bash script to create some dummy 'temperature' data,
looking at an experiment where the sample which is heated in an electric oven
(causing its temperature to increase linearly), and then is taken out of the oven
to cool down (losing temperature exponentially). We will then track this using
the output file which is created during the experiment.
"""

import os
from simvue_connector.connector import WrappedRun
import multiparser.parsing.tail as mp_tail_parser
import pathlib
import uuid
import csv

try:
    from typing import override
except ImportError:
    from typing_extensions import override


# Create a new class which inherits from WrappedRun
class TemperatureRun(WrappedRun):
    script_path: pathlib.Path | None = None

    # Override the `_pre_simulation` method to launch the process
    @override
    def _pre_simulation(self):
        # Call the base method first
        super()._pre_simulation()

        # Add a process to the run using `add_process`
        self.add_process(
            identifier="heating_experiment",
            executable="bash",
            script=self.script_path,
            completion_trigger=self._trigger,  # Sets a threading Event once the simulation is completed
        )

    # Override the `_during_simulation` method to track the temperature data
    @override
    def _during_simulation(self) -> None:
        if not self.file_monitor:
            raise RuntimeError("Simulation has not been launched.")

        if not self.script_path:
            raise RuntimeError("Expected script path to be initialised.")

        # Use the `tail` method of the Multiparser `FileMonitor` object to track file, line by line
        self.file_monitor.tail(
            path_glob_exprs=str(self.script_path.with_suffix(".csv")),
            parser_func=mp_tail_parser.record_csv,  # Use the built-in CSV parser, which returns a dictionary of data and metadata as each line is written
            callback=lambda csv_data, metadata: (
                self.log_metrics(  # Use data from those two dictionaries to log a metric:
                    {"sample_temperature": csv_data["Temperature"]},
                    time=csv_data["Time"],
                    step=csv_data["Step"],
                )
            ),
        )

    # Override the `_post_simulation` method to upload the final CSV file of temperature data
    @override
    def _post_simulation(self) -> None:
        if not self.script_path:
            raise RuntimeError("Expected script path to be initialised.")

        self.save_file(self.script_path.with_suffix(".csv"), category="output")

        # And finally call the base method
        super()._post_simulation()

    # Override the `launch` method to accept the path to the bash script
    @override
    def launch(self, script_path: pathlib.Path) -> None:
        self.script_path = script_path
        # Call the base `launch` method to call the above methods in the correct order
        super().launch()

    # Override the `load` method to accept the path to an existing set of results (csv file)
    @override
    def load(self, results_path: pathlib.Path) -> None:
        # Can either call methods defined above if there is common functionality required,
        # or write custom logic for handling pre-existing simulations
        with open(results_path, "r") as data:
            for csv_data in csv.DictReader(data):
                self.log_metrics(
                    {"sample_temperature": csv_data["Temperature"]},
                    time=csv_data["Time"],
                    step=csv_data["Step"],
                )

        # Call post_simulation() to upload the result as an artifact
        self.script_path = results_path
        self._post_simulation()
