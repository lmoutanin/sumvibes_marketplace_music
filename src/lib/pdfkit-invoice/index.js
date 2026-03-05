const { createInvoice } = require("./createInvoice.js");

const invoice = {
  shipping: {
    name: 'John Doe',
    address: '1234 Main Street',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    postal_code: 94111,
  },
  items: [
    {
      item: 'TC 100',
      description: 'Toner Cartridge',
      quantity: 1,
      amount: 60,
    },
    {
      item: 'USB_EXT',
      description: 'USB Cable Extender',
      quantity: 1,
      amount: 20,
    },
  ],
  payment: {
    subtotal: 80.20,
    tax: 20.02,
    total: 100.22,
    invoice_nr: 1234,
  }
};


createInvoice(invoice, "invoice.pdf");