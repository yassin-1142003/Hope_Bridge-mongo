"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Printer, Download } from "lucide-react";
import Image from "next/image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface InvoiceItem {
  id: number;
  itemName: string;
  unitPrice: number;
  quantity: number;
  totalSelectedCurrency: number;
  totalUSD: number;
}

interface ExchangeRates {
  [currency: string]: number;
}

const InvoiceForm = () => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [invoiceTo, setInvoiceTo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceNumber, setinvoiceNumber] = useState("");

  const [projectName, setProjectName] = useState("");
  const [emergencyProject, setEmergencyProject] = useState("");
  const [managerName, setManagerName] = useState("Mohammed Zohd");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  const invoiceToOptions = ["OneNation", "Our Umma", "Ummah", "Dudley"];

  const banks = [
    {
      name: "Arab Islamic Bank",
      account:
        "Application Name: Hope bridge charity / Arab Islamic Bank 73 / Gaza Branch 421",
      swift: "AISBPS22",
      iban: "PS75AISB00000000210073421",
    },
    {
      name: "Bank of Palestine",
      account:
        "Application Name: Hope bridge charity / Bank of Palestine 45 / Gaza Branch 112",
      swift: "PALSPS22",
      iban: "PS75PALB000000002100745112",
    },
    {
      name: "Islamic Bank",
      account:
        "Application Name: Hope bridge charity / Islamic Bank 89 / Gaza Branch 223",
      swift: "ISBKPS22",
      iban: "PS75ISBK000000002100789223",
    },
  ];

  const currentBank =
    banks.find((bank) => bank.name === selectedBank) || banks[0];

  const currencies = [
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
    { code: "SAR", symbol: "SR", name: "Saudi Riyal" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  ];

  const currentCurrency =
    currencies.find((c) => c.code === selectedCurrency) || currencies[0];
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 1,
      itemName: "",
      unitPrice: 0,
      quantity: 1,
      totalSelectedCurrency: 0,
      totalUSD: 0,
    },
    {
      id: 2,
      itemName: "",
      unitPrice: 0,
      quantity: 1,
      totalSelectedCurrency: 0,
      totalUSD: 0,
    },
  ]);

  // Fetch exchange rates on component mount and when currency changes
  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    setIsLoadingRates(true);
    try {
      const response = await fetch("/api/currency");
      const data = await response.json();
      setExchangeRates(data.rates);
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      // Fallback rates if API fails
      setExchangeRates({
        USD: 1.08,
        GBP: 0.86,
        EUR: 1.0,
        JPY: 160.5,
        CHF: 0.94,
        CAD: 1.47,
        AUD: 1.65,
        CNY: 7.85,
        ILS: 3.95,
        SAR: 4.05,
        AED: 3.97,
      });
    } finally {
      setIsLoadingRates(false);
    }
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const totalSelectedCurrency = item.unitPrice * item.quantity;
    // Convert from selected currency to USD
    let totalUSD = totalSelectedCurrency;

    if (
      selectedCurrency !== "USD" &&
      exchangeRates[selectedCurrency] &&
      exchangeRates["USD"]
    ) {
      // Convert selected currency to EUR (base), then to USD
      const amountInEUR =
        totalSelectedCurrency / exchangeRates[selectedCurrency];
      totalUSD = amountInEUR * exchangeRates["USD"];
    }

    return { totalSelectedCurrency, totalUSD };
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          const { totalSelectedCurrency, totalUSD } =
            calculateItemTotal(updatedItem);
          return { ...updatedItem, totalSelectedCurrency, totalUSD };
        }
        return item;
      })
    );
  };

  const addRow = () => {
    const newId = Math.max(...items.map((i) => i.id), 0) + 1;
    setItems([
      ...items,
      {
        id: newId,
        itemName: "",
        unitPrice: 0,
        quantity: 1,
        totalSelectedCurrency: 0,
        totalUSD: 0,
      },
    ]);
  };

  const removeRow = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const grandTotalSelectedCurrency = items.reduce(
    (sum, item) => sum + item.totalSelectedCurrency,
    0
  );
  const grandTotalUSD = items.reduce((sum, item) => sum + item.totalUSD, 0);

  const handlePrint = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Brand Colors
      const primaryRed = [199, 42, 42]; // #c72a2a
      const darkRed = [159, 32, 32];
      const lightGray = [245, 245, 245];
      const darkGray = [51, 51, 51];

      // ELEGANT HEADER SECTION WITH GRADIENT EFFECT
      // Top red banner with decorative elements
      doc.setFillColor(...primaryRed);
      doc.rect(0, 0, pageWidth, 66, "B");

      // Decorative corner triangles
      doc.setFillColor(...darkRed);
      doc.triangle(0, 0, 30, 0, 0, 30, "F");
      doc.triangle(pageWidth, 0, pageWidth - 30, 0, pageWidth, 30, "F");

      // Logo placement with white border
      const logoUrl = "/logo.png";
      const logoWidth = 40;
      const logoHeight = 40;

      // White circle background for logo
      doc.setFillColor(255, 255, 255);
      doc.circle(pageWidth / 2, 25, 21, "F");

      doc.addImage(
        logoUrl,
        "PNG",
        pageWidth / 2 - logoWidth / 2,
        3,
        logoWidth,
        logoHeight
      );

      // Organization name in white on red background
      doc.setFont("cairo", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("HOPE BRIDGE ASSOCIATION", pageWidth / 2, 54, {
        align: "center",
      });

      // Decorative line under header
      doc.setDrawColor(...primaryRed);
      doc.setLineWidth(0.5);
      doc.line(20, 56, pageWidth - 20, 56);

      // INVOICE TITLE SECTION - Modern box design
      let y = 68;
      doc.setFillColor(...lightGray);
      doc.roundedRect(pageWidth / 2 - 35, y - 8, 70, 16, 3, 3, "F");

      doc.setFillColor(...primaryRed);
      doc.roundedRect(pageWidth / 2 - 33, y - 7, 66, 14, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("INVOICE", pageWidth / 2, y + 2, { align: "center" });
      doc.setTextColor(0, 0, 0);

      // INVOICE DETAILS SECTION - Two-column elegant layout
      y = 92;

      // Left column box
      doc.setFillColor(...lightGray);
      doc.roundedRect(15, y - 5, 85, 24, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...darkGray);
      doc.text("INVOICE TO:", 20, y + 3);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...primaryRed);
      doc.text(invoiceTo || "-", 43, y + 3);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...darkGray);
      doc.text("INVOICE NO:", 20, y + 8);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...primaryRed);
      doc.text(invoiceNo || "-", 43, y + 8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...darkGray);
      doc.text("INVOICE Number:", 20, y + 13);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...primaryRed);
      doc.text(invoiceNumber || "-", 50, y + 13);

      // Right column box
      doc.setFillColor(...lightGray);
      doc.roundedRect(110, y - 5, 85, 24, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...darkGray);
      doc.text("DATE:", 115, y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...primaryRed);
      const formattedDate = invoiceDate || "";
      doc.text(formattedDate, 115, y + 6);

      // PROJECT INFORMATION - Styled box
      y = 124;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...primaryRed);
      doc.setLineWidth(0.8);
      doc.roundedRect(15, y - 5, pageWidth - 30, 20, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...darkGray);
      doc.text(
        projectName || "Gaza Strip Relief Project",
        pageWidth / 2,
        y + 4,
        {
          align: "center",
        }
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(...darkGray);
      doc.text(
        emergencyProject || "Emergency Project War September 2025",
        pageWidth / 2,
        y + 10,
        { align: "center" }
      );

      // ITEMS TABLE - Professional design with alternating rows
      y = 152;
      const colX = [20, 50, 115, 140, 165, 185];

      // Table header with red background
      doc.setFillColor(...primaryRed);
      doc.roundedRect(15, y - 7, pageWidth - 20, 10, 1, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("NO", colX[0], y);
      doc.text("ITEM DESCRIPTION", colX[1], y);
      doc.text("UNIT PRICE", colX[2], y);
      doc.text("QTY", colX[3], y);
      doc.text(`TOTAL (${selectedCurrency})`, colX[4], y);
      doc.text("TOTAL ($)", colX[5], y);

      y += 8;
      doc.setTextColor(0, 0, 0);

      // Items rows with alternating background
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      items.forEach((item, index) => {
        if (!item.itemName && !item.unitPrice && !item.quantity) {
          return;
        }
        if (y > 235) {
          doc.addPage();
          y = 20;
        }

        // Alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(15, y - 4, pageWidth - 20, 7, "F");
        }

        doc.setTextColor(...darkGray);
        doc.text(String(index + 1), colX[0], y);
        doc.text(item.itemName || "-", colX[1], y);
        doc.text(
          `${selectedCurrency} ${item.unitPrice.toFixed(2)}`,
          colX[2],
          y
        );
        doc.text(String(item.quantity), colX[3], y);
        doc.text(
          `${selectedCurrency} ${item.totalSelectedCurrency.toFixed(2)}`,
          colX[4],
          y
        );
        doc.text(`$${item.totalUSD.toFixed(2)}`, colX[5], y);

        y += 7;
      });

      // TOTALS SECTION - Highlighted box
      y += 15;
      doc.setFillColor(...primaryRed);
      doc.roundedRect(135, y - 5, 70, 10, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("TOTAL:", 140, y + 1);
      doc.text(
        `${selectedCurrency} ${grandTotalSelectedCurrency.toFixed(2)}`,
        160,
        y + 1
      );
      doc.text(`$${grandTotalUSD.toFixed(2)}`, 185, y + 1);

      doc.setTextColor(0, 0, 0);

      // SIGNATURE SECTION
      y += 18;
      doc.setDrawColor(...primaryRed);
      doc.setLineWidth(0.3);
      doc.line(20, y + 10, 80, y + 10);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...darkGray);
      doc.text("General Manager", 20, y + 15);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(managerName || "Mohammed Zohd", 20, y + 20);

      // FOOTER SECTION - Elegant design
      const footerY = pageHeight - 55;

      // Footer background
      doc.setFillColor(...lightGray);
      doc.rect(0, footerY - 5, pageWidth, 60, "F");

      // Red accent line
      doc.setFillColor(...primaryRed);
      doc.rect(pageWidth / 4, footerY - 5, pageWidth / 2, 1, "F");

      // Organization info
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...primaryRed);
      doc.text("Palestinian Hope Bridge Charity", pageWidth / 2, footerY + 5, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...darkGray);
      doc.text(
        "Gaza – Alnasser - Alababidi crossroad in front of Ahshammali center",
        pageWidth / 2,
        footerY + 11,
        { align: "center" }
      );
      doc.text(`License No. GA-1123-C`, pageWidth / 2, footerY + 16, {
        align: "center",
      });
      doc.text(
        "Tel: 082872707 | Mobile: 00970592130200",
        pageWidth / 2,
        footerY + 21,
        { align: "center" }
      );

      // Bank details with icon-style design
      if (currentBank) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...primaryRed);
        doc.text("BANK DETAILS", pageWidth / 2, footerY + 28, {
          align: "center",
        });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...darkGray);
        doc.text(
          `${currentBank.name} | Account: ${currentBank.account}`,
          pageWidth / 2,
          footerY + 33,
          {
            align: "center",
          }
        );
        doc.text(
          `SWIFT: ${currentBank.swift} | IBAN: ${currentBank.iban}`,
          pageWidth / 2,
          footerY + 37,
          {
            align: "center",
          }
        );
      }

      const filename = `invoice_${invoiceNumber || "draft"}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 via-primary/5 to-background p-4 md:p-8">
      <div
        ref={invoiceRef}
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-primary to-primary/80 p-8 print:hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Image
                  className="w-20 h-20 object-contain"
                  src="/logo.webp"
                  alt="Logo"
                  width={100}
                  height={100}
                />
              </div>
              <div className="text-white">
                <h1 className="text-sm font-semibold mb-1">
                  جمعية جسر الأمل الخيرية الفلسطينية
                </h1>
                <h2 className="text-lg font-bold">
                  Palestinian Hope Bridge Charitable Association
                </h2>
              </div>
            </div>
            <div className="bg-white text-primary px-8 py-3 rounded-full shadow-lg">
              <span className="text-2xl font-bold tracking-wider">INVOICE</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-linear-to-br from-primary/5 to-primary/10 p-4 rounded-xl border-l-4 border-primary">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Invoice To:
              </label>
              <select
                value={invoiceTo}
                onChange={(e) => setInvoiceTo(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">Select recipient...</option>
                {invoiceToOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-linear-to-br from-primary/5 to-primary/10 p-4 rounded-xl border-l-4 border-primary">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Date:
              </label>
              <input
                title="date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="bg-linear-to-br from-primary/5 to-primary/10 p-4 rounded-xl border-l-4 border-primary">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Invoice No:
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g., 09/2025"
              />
            </div>
            <div className="bg-linear-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border-l-4 border-emerald-500">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Currency:
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="flex-1 bg-white border-2 border-emerald-200 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                  disabled={isLoadingRates}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                {isLoadingRates && (
                  <div className="flex items-center px-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-linear-to-br from-primary/5 to-primary/10 p-4 rounded-xl border-l-4 border-primary">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Invoice Number:
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setinvoiceNumber(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g., 0014"
              />
            </div>
          </div>

          {/* Project Section */}
          <div className="bg-linear-to-r from-amber-50 to-amber-100 p-6 rounded-xl mb-8 border-2 border-amber-200">
            <div className="mb-4">
              <label className="block text-center text-sm font-bold text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-white border-2 border-amber-200 rounded-lg px-4 py-3 text-center font-semibold focus:outline-none focus:border-primary transition-colors"
                placeholder="Gaza strip Relief project"
              />
            </div>
            <div>
              <label className="block text-center text-sm font-bold text-gray-700 mb-2">
                Emergency Project
              </label>
              <input
                type="text"
                value={emergencyProject}
                onChange={(e) => setEmergencyProject(e.target.value)}
                className="w-full bg-white border-2 border-amber-200 rounded-lg px-4 py-3 text-center font-semibold text-red-600 focus:outline-none focus:border-primary transition-colors"
                placeholder="Emergency Project War September 2025"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-8 rounded-xl shadow-lg">
            <table className="w-full">
              <thead className="bg-linear-to-r from-primary to-primary/80 text-white">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Unit P ({currentCurrency.symbol})
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    QTY
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Total ({currentCurrency.symbol})
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Total ($)
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider print:hidden">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="bg-gray-50 hover:bg-gray-100 transition-colors border-b-2 border-white"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) =>
                          updateItem(item.id, "itemName", e.target.value)
                        }
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                        placeholder="Item name"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        title="price"
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "unitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                        step="0.01"
                        placeholder={`${currentCurrency.symbol}0.00`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        title="quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={`${currentCurrency.symbol} ${item.totalSelectedCurrency.toFixed(2)}`}
                        readOnly
                        className="w-full bg-emerald-50 border-2 border-emerald-200 rounded-lg px-3 py-2 font-semibold text-emerald-700"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={`$ ${item.totalUSD.toFixed(2)}`}
                        readOnly
                        className="w-full bg-gray-100 border-2 border-gray-200 rounded-lg px-3 py-2 font-semibold text-gray-700"
                      />
                    </td>
                    <td className="px-4 py-3 text-center print:hidden">
                      <button
                        onClick={() => removeRow(item.id)}
                        className="text-red-500 hover:text-red-700 font-bold disabled:opacity-30"
                        disabled={items.length === 1}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-linear-to-r from-amber-100 to-amber-200">
                  <td
                    colSpan={3}
                    className="px-4 py-4 text-right font-bold text-lg"
                  >
                    TOTAL
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-lg text-emerald-600">
                      {currentCurrency.symbol}{" "}
                      {grandTotalSelectedCurrency.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-lg text-primary">
                      $ {grandTotalUSD.toFixed(2)}
                    </span>
                  </td>
                  <td className="print:hidden"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-8 print:hidden">
            <button
              onClick={addRow}
              className="flex items-center gap-2 bg-linear-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Row
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-linear-to-r from-primary to-primary/80 text-white px-8 py-3 rounded-full font-bold hover:from-primary/90 hover:to-primary transition-all transform hover:scale-105 shadow-lg"
            >
              <Download className="w-5 h-5" />
              Generate PDF
            </button>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-200 pt-6 text-sm text-gray-600 space-y-4 print:hidden">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">General manager:</span>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="flex-1 border-b-2 border-gray-300 px-2 py-1 focus:outline-none focus:border-primary transition-colors print:border-none"
                placeholder="Enter manager name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Select Bank:
                </label>
                <select
                  name="bank"
                  title="bank"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Select a bank...</option>
                  {banks.map((bank) => (
                    <option key={bank.name} value={bank.name}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedBank && (
              <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                <p className="mb-2">
                  <span className="font-bold text-gray-800">Bank account:</span>{" "}
                  {currentBank.account}
                </p>
                <p className="mb-2">
                  <span className="font-bold text-gray-800">SWIFT CODE:</span>{" "}
                  {currentBank.swift}{" "}
                  <span className="font-bold text-gray-800">
                    / Bank account number / IBAN:
                  </span>{" "}
                  {currentBank.iban}
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-xl">
              <p>
                <span className="font-bold text-gray-800">Address:</span> Gaza –
                Alnasser-Alqababid crossroad in front of Ahshammadi center /
                License No. GA-1123-C
              </p>
              <p className="mt-2">
                <span className="font-bold text-gray-800">Telephone:</span>{" "}
                +85257207 /{" "}
                <span className="font-bold text-gray-800">Mobile:</span>{" "}
                0097652136200
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print\:hidden,
          .print-header,
          .print-footer {
            display: none !important;
          }

          .min-h-screen {
            min-height: auto !important;
          }

          .bg-linear-to-br,
          .bg-linear-to-r {
            background: white !important;
          }

          .shadow-2xl,
          .shadow-lg {
            box-shadow: none !important;
          }

          .rounded-2xl,
          .rounded-xl {
            border-radius: 0 !important;
          }

          .p-4,
          .p-8 {
            padding: 8px !important;
          }

          .mb-8 {
            margin-bottom: 16px !important;
          }

          .gap-4,
          .gap-6 {
            gap: 8px !important;
          }

          input[type="text"],
          input[type="date"],
          input[type="number"],
          select {
            border: 1px solid #000 !important;
            background: white !important;
            color: black !important;
          }

          .bg-linear-to-br.from-primary\/5.to-primary\/10,
          .bg-linear-to-r.from-amber-50.to-amber-100,
          .bg-linear-to-br.from-blue-50.to-blue-100,
          .bg-gray-50 {
            background: white !important;
            border: 1px solid #000 !important;
          }

          .border-l-4,
          .border-2 {
            border: 1px solid #000 !important;
          }

          .hover\\:bg-gray-100:hover,
          .hover\\:bg-gray-50:hover {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceForm;
