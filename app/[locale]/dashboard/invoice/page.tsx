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
  totalGBP: number;
  totalUSD: number;
}

const InvoiceForm = () => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [invoiceTo, setInvoiceTo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [invoiceNo, setInvoiceNo] = useState("");
  const [projectName, setProjectName] = useState("");
  const [emergencyProject, setEmergencyProject] = useState("");
  const [managerName, setManagerName] = useState("Mohammed Zohd");
  const [selectedBank, setSelectedBank] = useState("");

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
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 1,
      itemName: "",
      unitPrice: 0,
      quantity: 1,
      totalGBP: 0,
      totalUSD: 0,
    },
    {
      id: 2,
      itemName: "",
      unitPrice: 0,
      quantity: 1,
      totalGBP: 0,
      totalUSD: 0,
    },
  ]);

  const exchangeRate = 1.27; // 1 GBP = 1.27 USD

  const calculateItemTotal = (item: InvoiceItem) => {
    const totalGBP = item.unitPrice * item.quantity;
    const totalUSD = totalGBP * exchangeRate;
    return { totalGBP, totalUSD };
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          const { totalGBP, totalUSD } = calculateItemTotal(updatedItem);
          return { ...updatedItem, totalGBP, totalUSD };
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
        totalGBP: 0,
        totalUSD: 0,
      },
    ]);
  };

  const removeRow = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const grandTotalGBP = items.reduce((sum, item) => sum + item.totalGBP, 0);
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
      let y = 15;

      // -------- HEADER --------
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(
        "Palestinian Hope Bridge Charitable Association",
        pageWidth / 2,
        y,
        { align: "center" }
      );

      // INVOICE BOX
      y += 12;
      doc.setFillColor(255, 153, 102);
      doc.rect(pageWidth / 2 - 25, y - 6, 50, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text("INVOICE", pageWidth / 2, y, { align: "center" });
      doc.setTextColor(0, 0, 0);

      // Invoice To + Date
      y += 12;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice to: ${invoiceTo || "-"}`, 20, y);
      doc.text(`Date: ${invoiceDate || ""}`, pageWidth - 20, y, {
        align: "right",
      });

      // Invoice Number
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text(`Invoice No: ${invoiceNo || "-"}`, pageWidth / 2, y, {
        align: "center",
      });

      // Project Title
      y += 12;
      doc.setFontSize(12);
      doc.text(projectName || "Gaza strip Relief project", pageWidth / 2, y, {
        align: "center",
      });
      y += 7;
      doc.text(
        emergencyProject || "Emergency Project War September 2025",
        pageWidth / 2,
        y,
        { align: "center" }
      );

      // ---------- TABLE ----------
      y += 12;

      const col = {
        no: 15,
        item: 40,
        unit: 110,
        qty: 135,
        totalGBP: 160,
        totalUSD: 185,
      };

      // Header
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("No", col.no, y);
      doc.text("ITEMS", col.item, y);
      doc.text("UNIT P (£)", col.unit, y);
      doc.text("QTY", col.qty, y);
      doc.text("TOTAL (£)", col.totalGBP, y);
      doc.text("TOTAL ($)", col.totalUSD, y);

      // Rows
      y += 5;
      doc.setFont("helvetica", "normal");
      items.forEach((item, i) => {
        if (!item.itemName) return;

        // Auto new page
        if (y > pageHeight - 40) {
          doc.addPage();
          y = 20;
        }

        doc.text(String(i + 1), col.no, y);
        doc.text(item.itemName, col.item, y);
        doc.text(item.unitPrice.toFixed(2), col.unit, y, { align: "right" });
        doc.text(String(item.quantity), col.qty, y, { align: "right" });
        doc.text(item.totalGBP.toFixed(2), col.totalGBP, y, { align: "right" });
        doc.text(item.totalUSD.toFixed(2), col.totalUSD, y, { align: "right" });

        y += 6;
      });

      // Total Row
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.text("Total:", col.qty, y);
      doc.text(grandTotalGBP.toFixed(2), col.totalGBP, y, { align: "right" });
      doc.text(grandTotalUSD.toFixed(2), col.totalUSD, y, { align: "right" });

      // ---------- MANAGER ----------
      y += 12;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("General manager", 20, y);
      y += 5;
      doc.text(managerName || "Mohammed Zohd", 20, y);

      // ---------- BANK INFO AT BOTTOM ----------
      if (currentBank) {
        const bankY = pageHeight - 35;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Bank Information", pageWidth / 2, bankY, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.text(`Bank: ${currentBank.name}`, pageWidth / 2, bankY + 6, {
          align: "center",
        });
        doc.text(currentBank.account, pageWidth / 2, bankY + 12, {
          align: "center",
        });
        doc.text(`SWIFT: ${currentBank.swift}`, pageWidth / 2, bankY + 18, {
          align: "center",
        });
        doc.text(`IBAN: ${currentBank.iban}`, pageWidth / 2, bankY + 24, {
          align: "center",
        });
      }

      doc.save(`invoice_${invoiceNo || "draft"}.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF error");
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-linear-to-br from-primary/5 to-primary/10 p-4 rounded-xl border-l-4 border-primary">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Invoice To:
              </label>
              <input
                type="text"
                value={invoiceTo}
                onChange={(e) => setInvoiceTo(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter recipient name"
              />
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
                    Unit P (£)
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    QTY
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Total (£)
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
                        value={`£ ${item.totalGBP.toFixed(2)}`}
                        readOnly
                        className="w-full bg-gray-100 border-2 border-gray-200 rounded-lg px-3 py-2 font-semibold text-gray-700"
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
                    colSpan={4}
                    className="px-4 py-4 text-right font-bold text-lg"
                  >
                    TOTAL
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-lg text-primary">
                      £ {grandTotalGBP.toFixed(2)}
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
