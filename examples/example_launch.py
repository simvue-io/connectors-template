"""
Connector Example
===================
This is an example launching a simulation with the {YourRun} Connector class.

Explain what your example simulation does...

Provide instructions on how to run your connector, eg:
    - Clone this repository: git clone {link}
    - Create a virtual environment: python -m venv venv
    - Activate the environment: source venv/bin/activate
    - Install the module: pip install .
    - Etc...
"""

import pathlib
import uuid
from examples.connector_example import TemperatureRun


def custom_connector_example(offline: bool = False) -> str | None:

    # Remove results from previous run of this example
    pathlib.Path(__file__).parent.joinpath("temperatures.csv").unlink(missing_ok=True)

    # Use our custom connector class
    with TemperatureRun(mode="offline" if offline else "online") as run:
        # Initialize the run as normal
        _uuid = f"{uuid.uuid4()}".split("-")[0]
        run.init(
            name=f"custom-connector-example-{_uuid}",
            folder="/examples",
            description="Simulate an experiment where a sample is heated and then left to cool, tracking the temperature.",
            tags=["example", "heating-cooling"],
        )

        # Can upload extra things we care about, eg could upload some metadata
        run.update_metadata(
            {"initial_temperature": 20, "heating_time": 50, "cooling_time": 100}
        )
        # Then run launch to start the experiment
        run.launch(pathlib.Path(__file__).parent.joinpath("temperatures.sh"))

        return run.id


if __name__ == "__main__":
    _ = custom_connector_example()
