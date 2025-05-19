/**
 * chatbot-test.js
 * 
 * Script untuk mengotomatisasi pengujian chatbot Hyperjump menggunakan Puppeteer.
 * 
 * Fitur Utama:
 * - Membaca test case dari file 'test-cases.xlsx' (Kolom E: Input, Kolom G: Expected Sample Answer).
 * - Berinteraksi dengan chatbot (input pertanyaan, menunggu balasan).
 * - Memvalidasi balasan bot terhadap 'Expected Sample Answer' menggunakan pencocokan 'includes' (case-insensitive).
 * - Menyimpan hasil pengujian dalam format TXT, JSON, dan XLSX di folder 'output'.
 * 
 * Dependensi Utama:
 * - puppeteer: Untuk otomatisasi browser.
 * - xlsx: Untuk membaca dan menulis file Excel.
 * - cli-table3: Untuk menampilkan hasil dalam format tabel di konsol.
 * 
 * Cara Menjalankan:
 * node chatbot-test.js
 */

const puppeteer = require('puppeteer');
const Table = require('cli-table3');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

(async () => {
  let testCases = [];
  try {
    const workbook = XLSX.readFile(path.join(__dirname, 'test-cases.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`Reading test cases from: test-cases.xlsx, Sheet: ${sheetName}`);
    for (const row of rawData) {
      const input = row[4] ? row[4].toString().trim() : ''; 
      const expected = row[6] ? row[6].toString().trim() : ''; 

      if (input) { 
        testCases.push({ input, expected });
      }
    }
    console.log(`Found ${testCases.length} test cases in Excel file.`);
    if (testCases.length === 0) {
        console.error("No valid test cases found in Excel (Column E empty or file issue). Exiting.");
        return;
    }

  } catch (e) {
    console.error(`Error reading or processing test-cases.xlsx: ${e.message}`);
    console.error("Please ensure 'test-cases.xlsx' exists and is a valid Excel file with data in columns E and G.");
    return; 
  }

  const browser = await puppeteer.launch({ headless: false, slowMo: 100 }); 
  const page = await browser.newPage();
  await page.goto('https://hyperjump-sales-bot.app.n8n.cloud/webhook/6275a2e4-8f39-4fcb-a687-fc8f2ff92c5f/chat', {
    waitUntil: 'networkidle2'
  });
  await new Promise(resolve => setTimeout(resolve, 3000)); 

  let frame = page; 
  let switchedToIframe = false;
  const CHAT_INPUT_SELECTOR = 'textarea[placeholder="Type your question.."]';
  const BOT_MESSAGE_SELECTOR = 'div.chat-message.chat-message-from-bot';
  const TYPING_INDICATOR_CLASS = 'chat-message-typing'; 

  try {
    console.log("Checking for iframes...");
    await page.waitForSelector('iframe', { timeout: 3000, visible: true }).catch(() => console.log("No iframes became visible quickly (this is ok)."));
    const iframes = await page.$$('iframe');
    
    if (iframes.length > 0) {
      console.log(`Found ${iframes.length} iframe(s). Evaluating...`);
      for (let i = 0; i < iframes.length; i++) {
        const iframeElement = iframes[i];
        const contentFrame = await iframeElement.contentFrame();
        if (contentFrame) {
          const chatInputInFrame = await contentFrame.$(CHAT_INPUT_SELECTOR);
          if (chatInputInFrame) { 
            console.log(`Found chat input in iframe ${i}. Switching context.`);
            frame = contentFrame;
            switchedToIframe = true;
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            break; 
          } else {
            console.log(`Iframe ${i} does not seem to contain the chat input field.`);
          }
        } else {
          console.log(`Iframe ${i} contentFrame is null.`);
        }
      }
      if (!switchedToIframe) {
        console.log("No suitable iframe found. Continuing with main page context.");
      }
    } else {
      console.log("No iframes found on the page.");
    }
  } catch (e) {
    console.warn(`Error during iframe check: ${e.message.split('\n')[0]}. Continuing with main page context.`);
  }

  const resultTable = new Table({
    head: ['Input', 'Expected Sample Answer', 'Bot Response', 'Result'],
    colWidths: [30, 40, 50, 10],
    wordWrap: true
  });
  const jsonResults = []; 

  let previousBotMessageCount = 0;
  try {
    console.log(`Attempting to find initial bot messages (context: ${switchedToIframe ? 'iframe' : 'main page'}) using selector: ${BOT_MESSAGE_SELECTOR}`);
    await frame.waitForSelector(BOT_MESSAGE_SELECTOR, { timeout: 10000, visible: true }).catch(() => {
        console.log("No initial bot messages found quickly, or selector might be too specific for welcome message. Proceeding.");
    }); 
    const initialBotMessages = await frame.$$(BOT_MESSAGE_SELECTOR);
    previousBotMessageCount = initialBotMessages.length;
    console.log(`Initial bot message count: ${previousBotMessageCount}`);
  } catch (e) {
    console.warn(`Warning: Could not get initial bot message count (context: ${switchedToIframe ? 'iframe' : 'main page'}): ${e.message.split('\n')[0]}. Proceeding with count 0.`);
    previousBotMessageCount = 0;
  }

  for (const test of testCases) { 
    const { input, expected } = test; 
    let botReplyText = "ERROR_PROCESSING_TEST_CASE";
    let testPassed = false;
    let testStatusIcon = '❌';
    let errorMessage = '';

    console.log(`\nProcessing input: "${input}"`);
    console.log(`Expected sample: "${expected.substring(0, 50)}..."`); 

    try {
      console.log(`Waiting for input field: ${CHAT_INPUT_SELECTOR} (context: ${switchedToIframe ? 'iframe' : 'main page'})`);
      await frame.waitForSelector(CHAT_INPUT_SELECTOR, { visible: true, timeout: 30000 }); 
      await frame.type(CHAT_INPUT_SELECTOR, input);
      await frame.keyboard.press('Enter');
      console.log(`Sent: "${input}", waiting for reply...`);
    } catch (e) {
      errorMessage = `Error: Failed to type/send - ${e.message.split('\n')[0]}`;
      console.error(`Error interacting with input field for "${input}": ${e.message.split('\n')[0]}`);
      botReplyText = errorMessage;
      try {
        const currentMessages = await frame.$$(BOT_MESSAGE_SELECTOR);
        previousBotMessageCount = currentMessages.length;
      } catch (countError) { /* ignore */ }
      resultTable.push([input, expected, botReplyText, testStatusIcon]);
      jsonResults.push({ Input: input, 'Expected Sample Answer': expected, 'Bot Response': botReplyText, Result: testStatusIcon, Error: errorMessage });
      continue; 
    }

    botReplyText = "BOT_REPLY_NOT_FOUND_OR_TIMEOUT";
    let newReplyFound = false;
    const pollingStartTime = Date.now();
    const POLLING_TIMEOUT = 35000; 

    try {
      while (Date.now() - pollingStartTime < POLLING_TIMEOUT) {
        const botMessageElements = await frame.$$(BOT_MESSAGE_SELECTOR);
        
        if (botMessageElements.length > previousBotMessageCount) {
          const lastMessageElement = botMessageElements[botMessageElements.length - 1];
          const classList = await lastMessageElement.evaluate(node => Array.from(node.classList));
          
          if (!classList.includes(TYPING_INDICATOR_CLASS)) {
            const currentReply = await lastMessageElement.evaluate(node => node.innerText.trim());
            if (currentReply && currentReply.length > 0) { 
                botReplyText = currentReply;
                newReplyFound = true;
                previousBotMessageCount = botMessageElements.length; 
                break;
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 500)); 
      }

      if (!newReplyFound) {
        const finalBotElements = await frame.$$(BOT_MESSAGE_SELECTOR);
        let lastSeenText = 'none';
        if (finalBotElements.length > 0) {
            const lastElement = finalBotElements[finalBotElements.length -1];
            lastSeenText = await lastElement.evaluate(node => node.innerText.trim());
            if (await lastElement.evaluate(node => node.classList.contains(TYPING_INDICATOR_CLASS))) {
                lastSeenText = `(Typing indicator: ${lastSeenText})`;
            }
        }
        errorMessage = `Error: Timeout. Last seen: ${lastSeenText}`;
        console.error(`Timeout waiting for actual bot reply to "${input}". Last seen: "${lastSeenText}" (Total messages: ${finalBotElements.length})`);
        botReplyText = errorMessage;
        previousBotMessageCount = finalBotElements.length;
      }
    } catch (e) {
        errorMessage = `Error: Polling failed - ${e.message.split('\n')[0]}`;
        console.error(`Error during polling for bot reply to "${input}": ${e.message.split('\n')[0]}`);
        botReplyText = errorMessage;
        try {
            const currentMessages = await frame.$$(BOT_MESSAGE_SELECTOR);
            previousBotMessageCount = currentMessages.length;
        } catch (countError) { /* ignore */ }
    }
    
    if (newReplyFound && !errorMessage) { 
        if (expected) { 
            testPassed = botReplyText.toLowerCase().includes(expected.toLowerCase());
        } else {
            testPassed = true; 
        }
        testStatusIcon = testPassed ? '✅' : '❌';
    } else if (!newReplyFound && !errorMessage) { 
        testStatusIcon = '❌'; 
    } 
    
    resultTable.push([input, expected, botReplyText, testStatusIcon]);
    jsonResults.push({ Input: input, 'Expected Sample Answer': expected, 'Bot Response': botReplyText, Result: testStatusIcon, Error: errorMessage });
    console.log(`Bot reply: "${botReplyText.substring(0,100)}...", Result: ${testStatusIcon}`);
  }

  console.log('\n📋 Test Results:');
  console.log(resultTable.toString());

  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const txtFilePath = path.join(outputDir, `test_results_${timestamp}.txt`);
  const jsonFilePath = path.join(outputDir, `test_results_${timestamp}.json`);
  const xlsxFilePath = path.join(outputDir, `test_results_${timestamp}.xlsx`);

  fs.writeFileSync(txtFilePath, resultTable.toString(), 'utf8');
  console.log(`\n📄 Text results saved to: ${txtFilePath}`);

  fs.writeFileSync(jsonFilePath, JSON.stringify(jsonResults, null, 2), 'utf8');
  console.log(`📄 JSON results saved to: ${jsonFilePath}`);

  try {
    const worksheet = XLSX.utils.json_to_sheet(jsonResults);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TestResults");
    XLSX.writeFile(workbook, xlsxFilePath);
    console.log(`📊 Excel results saved to: ${xlsxFilePath}`);
  } catch (e) {
    console.error(`\n❌ Error saving Excel file: ${e.message}`);
    console.error("Ensure 'xlsx' library is installed by running: npm install xlsx");
  }

  if (browser) {
    await browser.close();
  }
})();
