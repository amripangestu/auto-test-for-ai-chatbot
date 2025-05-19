# Auto Test for AI Chatbot (Hyperjump)

test

## Project Description

This project contains an automation script for functional testing of the Hyperjump AI chatbot. The script uses Node.js and Puppeteer to interact with the chatbot's web interface, send a series of input questions defined in an Excel file, capture the bot's responses, and compare them against expected sample answers.

The main goal is to ensure the chatbot responds accurately and consistently to various test scenarios.

## Key Features

- Reads test cases from the `test-cases.xlsx` file.
  - Input questions are taken from Column E.
  - Expected sample answers (for reference) are taken from Column G.
- Uses Puppeteer to automate browser interaction with the chatbot.
- Validates bot responses against sample answers (currently using case-insensitive `includes` logic).
- Generates test result reports in multiple formats:
  - Concise table in the console.
  - Detailed text file (`.txt`).
  - JSON file (`.json`).
  - Excel file (`.xlsx`).
- Test results are saved in the `output/` directory with a timestamp.

## Prerequisites

Before running the script, ensure you have:

- [Node.js](https://nodejs.org/) (latest LTS version recommended)
- npm (usually installed with Node.js)
- Google Chrome or Chromium browser (used by Puppeteer)

## Installation

1.  **Clone the Repository (if you haven't already):**

    ```bash
    git clone https://github.com/amripangestu/auto-test-for-ai-chatbot.git
    cd auto-test-for-ai-chatbot
    ```

2.  **Install Dependencies:**
    From the project root directory, run the following command to install all required packages (like Puppeteer, xlsx, cli-table3):
    ```bash
    npm install
    ```

## `test-cases.xlsx` File Structure

The `test-cases.xlsx` file is the primary source for your test cases. Ensure this file has the following structure on its first sheet:

- **Column E**: Contains the input questions to be sent to the chatbot.
- **Column G**: Contains the "Sample Expected Answer" from the chatbot for reference. _Note: The current validation logic checks if the bot's response includes the text from this column._

Empty rows in Column E will be ignored.

## Running the Test Script

To run the test script, navigate to the project root directory in your terminal and execute:

```bash
node chatbot-test.js
```

The script will:

1.  Read `test-cases.xlsx`.
2.  Open a browser and interact with the chatbot.
3.  Display results in the console in real-time.
4.  Save report files in the `output/` directory.

## Test Result Output

After execution, you will find the following files in the `output/` directory (filenames include a timestamp):

- `test_results_YYYY-MM-DDTHH-MM-SS-MSZ.txt`: Detailed text report.
- `test_results_YYYY-MM-DDTHH-MM-SS-MSZ.json`: Report in JSON format.
- `test_results_YYYY-MM-DDTHH-MM-SS-MSZ.xlsx`: Report in Excel format.

## Future Development (Ideas)

- Implement more advanced comparison logic (e.g., using keyword matching from an additional Excel column or AI integration for similarity checking).
- Add the ability to take screenshots on failure.
- Integrate with a CI/CD system.

## Contributing

If you wish to contribute, please fork this repository and create a pull request. For major changes, please open an issue first to discuss what you would like to change.

---

_This README was created for the Hyperjump chatbot testing project._
