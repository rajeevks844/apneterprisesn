require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// ─── EMAIL SETUP ───
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail address
    pass: process.env.EMAIL_PASS,   // Gmail App Password (16 chars)
  }
});

// ─── ROUTES ───

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'A.P. Enterprises API running ✅', version: '1.0' });
});

// Contact form
app.post('/api/contact', async (req, res) => {
  const { name, phone, email, service, message } = req.body;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'rajeev@apenterprises.com',  // your business email
      subject: `New Service Request — ${service || 'General'} from ${name}`,
      html: `
        <h2>New Contact Request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Email:</b> ${email || 'Not provided'}</p>
        <p><b>Service:</b> ${service || 'General'}</p>
        <p><b>Message:</b> ${message || 'None'}</p>
      `
    });
    res.json({ success: true, message: 'Message received!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// RMA registration notification
app.post('/api/rma/register', async (req, res) => {
  const { name, email, phone, rmaId, device, problem } = req.body;
  try {
    // Email to customer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `RMA Registered — ${rmaId} | A.P. Enterprises`,
      html: `
        <h2>Your RMA is Registered! 🔧</h2>
        <p>Dear ${name},</p>
        <p>Your device has been received and registered.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td><b>RMA ID</b></td><td>${rmaId}</td></tr>
          <tr><td><b>Device</b></td><td>${device}</td></tr>
          <tr><td><b>Problem</b></td><td>${problem}</td></tr>
          <tr><td><b>Status</b></td><td>Received — Awaiting Inspection</td></tr>
        </table>
        <p>You will receive updates via email as we progress.</p>
        <p>📞 Questions? Call: +91 9891375767</p>
        <p>A.P. Enterprises, 208 Raja House, Nehru Place, New Delhi</p>
      `
    });
    // Alert to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `NEW RMA: ${rmaId} — ${name}`,
      html: `<h3>New RMA Registered</h3><p>ID: ${rmaId}</p><p>Customer: ${name} | ${phone} | ${email}</p><p>Device: ${device}</p><p>Problem: ${problem}</p>`
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// RMA status update notification
app.post('/api/rma/update', async (req, res) => {
  const { name, email, rmaId, status, notes, cost, eta } = req.body;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `RMA Update: ${rmaId} — ${status} | A.P. Enterprises`,
      html: `
        <h2>Your Repair Status Update 🔧</h2>
        <p>Dear ${name},</p>
        <p>RMA <b>${rmaId}</b> has been updated:</p>
        <table>
          <tr><td><b>New Status</b></td><td><b style="color:green">${status}</b></td></tr>
          ${cost ? `<tr><td><b>Cost</b></td><td>₹${cost}</td></tr>` : ''}
          ${eta ? `<tr><td><b>ETA</b></td><td>${eta} days</td></tr>` : ''}
          ${notes ? `<tr><td><b>Notes</b></td><td>${notes}</td></tr>` : ''}
        </table>
        <p>📞 +91 9891375767 | A.P. Enterprises</p>
      `
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Order confirmation
app.post('/api/order', async (req, res) => {
  const { name, email, oid, items, total } = req.body;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order Confirmed — ${oid} | A.P. Enterprises`,
      html: `
        <h2>Order Confirmed ✅</h2>
        <p>Dear ${name}, your order <b>${oid}</b> has been placed.</p>
        <p><b>Total: ₹${total}</b></p>
        <p>We will call you to confirm delivery.</p>
        <p>📞 +91 9891375767</p>
      `
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));