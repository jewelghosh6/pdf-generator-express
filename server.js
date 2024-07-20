const express = require('express');
const morgan = require('morgan');
const puppeteer = require('puppeteer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Set up Morgan for logging
app.use(morgan('combined'));

// Set up static file serving for accessing uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for file uploads
const upload = multer({
    dest: 'uploads/', // Destination folder
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to generate PDF from embedded HTML
app.get('/generate-pdf', async (req, res) => {
    const htmlContent = `
    <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; }
          .invoice-box table { width: 100%; line-height: inherit; text-align: left; }
          .invoice-box table td { padding: 5px; vertical-align: top; }
          .invoice-box table tr td:nth-child(2) { text-align: right; }
          .invoice-box table tr.top table td { padding-bottom: 20px; }
          .invoice-box table tr.information table td { padding-bottom: 40px; }
          .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
          .invoice-box table tr.item td { border-bottom: 1px solid #eee; }
          .invoice-box table tr.item.last td { border-bottom: none; }
          .invoice-box table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <table>
            <tr class="top">
              <td colspan="2">
                <table>
                  <tr>
                    <td class="title">
                      <h1>Invoice</h1>
                    </td>
                    <td>
                      Invoice #: 123<br>
                      Created: January 1, 2024<br>
                      Due: February 1, 2024
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="information">
              <td colspan="2">
                <table>
                  <tr>
                    <td>
                      Acme Corp.<br>
                      John Doe<br>
                      john@example.com
                    </td>
                    <td>
                      Customer Corp.<br>
                      Jane Smith<br>
                      jane@example.com
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="heading">
              <td>Item</td>
              <td>Price</td>
            </tr>
            <tr class="item">
              <td>Website design</td>
              <td>$300.00</td>
            </tr>
            <tr class="item">
              <td>Hosting (3 months)</td>
              <td>$75.00</td>
            </tr>
            <tr class="item last">
              <td>Domain name (1 year)</td>
              <td>$10.00</td>
            </tr>
            <tr class="total">
              <td></td>
              <td>Total: $38599999999999.00</td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;

    try {
        const browser = await puppeteer.launch({
            headless: 'new', // Use new headless mode
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        console.log('Generating PDF from embedded HTML...');
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });

        await browser.close();
        console.log('PDF generated successfully.');

        // Send the PDF buffer as a response
        res.contentType('application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

// Route to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        const file = req.file;
        console.log('File uploaded:', file);

        // Here you can perform additional processing on the file if needed

        res.status(200).send({ message: 'File uploaded successfully', file });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
