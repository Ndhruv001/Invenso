/**
 * Help.jsx
 * Pure UI component for Help & Documentation section
 * No backend logic - just informational content
 */

import React, { useState } from "react";
import {
  HelpCircle,
  Book,
  Zap,
  Keyboard,
  Mail,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Play,
  FileText,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  TrendingUp,
  Settings,
  BarChart3,
  Truck,
  Receipt
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const Help = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("getting-started");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // FAQ Data
  const faqs = [
    {
      id: 1,
      category: "General",
      question: "How do I create my first sale?",
      answer:
        "Navigate to Sales > Create New Sale. Select a customer, add products, set quantities and prices. The system will automatically calculate totals, GST, and profit. Click 'Save' to complete the sale."
    },
    {
      id: 2,
      category: "General",
      question: "How do I add a new product?",
      answer:
        "Go to Products > Add New Product. Fill in the product name, category, HSN code, unit type, opening stock, pricing, and threshold. The system will track inventory automatically from sales and purchases."
    },
    {
      id: 3,
      category: "Inventory",
      question: "How does the inventory system work?",
      answer:
        "Inventory is automatically updated when you create sales, purchases, or returns. The system maintains inventory logs for every transaction and calculates average cost and selling prices based on your transactions."
    },
    {
      id: 4,
      category: "Inventory",
      question: "What is the threshold field in products?",
      answer:
        "The threshold is the minimum stock level. When current stock falls below this number, the product appears in Low Stock Alerts on your dashboard, helping you reorder in time."
    },
    {
      id: 5,
      category: "Payments",
      question: "How do I record a payment?",
      answer:
        "Go to Payments > Add Payment. Select the payment type (Received/Paid), party, amount, payment mode, and reference. You can link payments to specific sales, purchases, or keep them as general entries."
    },
    {
      id: 6,
      category: "Payments",
      question: "What's the difference between Received and Paid?",
      answer:
        "Received means money coming into your business (from customers). Paid means money going out (to suppliers, expenses, etc.). This helps track cash flow accurately."
    },
    {
      id: 7,
      category: "Reports",
      question: "How do I view sales reports?",
      answer:
        "Navigate to the Dashboard for quick insights, or go to Sales section and use filters to view sales by date range, customer, or product. You can also download reports as Excel files."
    },
    {
      id: 8,
      category: "Reports",
      question: "What does Net Profit include?",
      answer:
        "Net Profit = (Sales Profit - Sale Returns Loss - Total Expenses). It gives you the actual profit after accounting for returns and operating costs."
    },
    {
      id: 9,
      category: "Parties",
      question: "What are party types?",
      answer:
        "Parties can be Customers (people who buy from you), Suppliers (people you buy from), Both (for dual relationships), Employees, Drivers, or Others. This helps organize your contacts."
    },
    {
      id: 10,
      category: "Settings",
      question: "Can I change the theme?",
      answer:
        "Yes! Click the theme switcher in the header to choose between Modern, Ocean, Forest, or Dark themes. Your preference is saved automatically."
    }
  ];

  // Getting Started Steps
  const gettingStartedSteps = [
    {
      title: "1. Set Up Your Business",
      description: "Add your business information and initial settings",
      icon: Settings,
      steps: [
        "Go to Settings and configure your business details",
        "Set up tax rates and default units if needed",
        "Choose your preferred theme"
      ]
    },
    {
      title: "2. Add Categories",
      description: "Create product and expense categories",
      icon: FileText,
      steps: [
        "Navigate to Categories section",
        "Add product categories (e.g., Electronics, Clothing)",
        "Add expense categories (e.g., Rent, Utilities)"
      ]
    },
    {
      title: "3. Add Parties",
      description: "Register your customers and suppliers",
      icon: Users,
      steps: [
        "Go to Parties > Add New Party",
        "Enter name, contact details, and party type",
        "Set opening balance if there's any existing credit/debit"
      ]
    },
    {
      title: "4. Add Products",
      description: "Build your product catalog",
      icon: Package,
      steps: [
        "Navigate to Products > Add Product",
        "Fill in product details and pricing",
        "Set opening stock and threshold levels"
      ]
    },
    {
      title: "5. Start Selling",
      description: "Create your first sale",
      icon: ShoppingCart,
      steps: [
        "Go to Sales > Create New Sale",
        "Select customer and add products",
        "Record payment if received immediately"
      ]
    },
    {
      title: "6. Track Everything",
      description: "Monitor your business on the dashboard",
      icon: BarChart3,
      steps: [
        "Check Dashboard for daily/monthly summaries",
        "View low stock alerts",
        "Monitor receivables and payables"
      ]
    }
  ];

  // Features Documentation
  const features = [
    {
      category: "Sales Management",
      icon: ShoppingCart,
      items: [
        {
          name: "Create Sales",
          description: "Record sales transactions with automatic profit calculation"
        },
        {
          name: "Sale Returns",
          description: "Process customer returns and adjust inventory automatically"
        },
        {
          name: "Invoice Management",
          description: "Auto-generated invoice numbers for each sale"
        },
        {
          name: "Payment Tracking",
          description: "Record partial or full payments against sales"
        }
      ]
    },
    {
      category: "Purchase Management",
      icon: Package,
      items: [
        {
          name: "Record Purchases",
          description: "Track inventory purchases from suppliers"
        },
        {
          name: "Purchase Returns",
          description: "Return items to suppliers and update stock"
        },
        {
          name: "Supplier Payments",
          description: "Manage payments to suppliers"
        },
        {
          name: "Cost Tracking",
          description: "Automatic average cost calculation"
        }
      ]
    },
    {
      category: "Inventory Control",
      icon: TrendingUp,
      items: [
        {
          name: "Real-time Stock",
          description: "Live stock updates with every transaction"
        },
        {
          name: "Low Stock Alerts",
          description: "Dashboard warnings for products below threshold"
        },
        {
          name: "Inventory Logs",
          description: "Complete history of stock movements"
        },
        {
          name: "Multi-unit Support",
          description: "Track inventory in PCS, KG, LITER, METER, etc."
        }
      ]
    },
    {
      category: "Financial Management",
      icon: CreditCard,
      items: [
        {
          name: "Payment Recording",
          description: "Track all incoming and outgoing payments"
        },
        {
          name: "Expense Tracking",
          description: "Record and categorize business expenses"
        },
        {
          name: "Outstanding Reports",
          description: "View receivables and payables in real-time"
        },
        {
          name: "Profit Analysis",
          description: "Automatic profit calculation on every sale"
        }
      ]
    },
    {
      category: "Transport Management",
      icon: Truck,
      items: [
        {
          name: "Trip Recording",
          description: "Track transport trips and assignments"
        },
        {
          name: "Driver Management",
          description: "Maintain driver records and payments"
        },
        {
          name: "Route Tracking",
          description: "Record from/to locations for each trip"
        },
        {
          name: "Transport Payments",
          description: "Manage payments for transport services"
        }
      ]
    },
    {
      category: "Reporting & Analytics",
      icon: BarChart3,
      items: [
        {
          name: "Dashboard Insights",
          description: "Real-time business metrics and KPIs"
        },
        {
          name: "Sales Trends",
          description: "Visual charts showing sales and profit trends"
        },
        {
          name: "Top Products",
          description: "Identify best-selling items"
        },
        {
          name: "Export Reports",
          description: "Download data as Excel or PDF files"
        }
      ]
    }
  ];

  // Keyboard Shortcuts
  const shortcuts = [
    { keys: ["Ctrl", "S"], action: "Save current form" },
    { keys: ["Ctrl", "N"], action: "Create new entry" },
    { keys: ["Ctrl", "F"], action: "Search/Filter" },
    { keys: ["Ctrl", "P"], action: "Print current page" },
    { keys: ["Esc"], action: "Close modal/dialog" },
    { keys: ["Alt", "D"], action: "Go to Dashboard" },
    { keys: ["Alt", "S"], action: "Go to Sales" },
    { keys: ["Alt", "P"], action: "Go to Products" }
  ];

  // Filter FAQs based on search
  const filteredFaqs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = id => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div
      className={`space-y-6 overflow-auto max-h-[calc(100vh-100px)] min-h-0 ${theme.bg} ${theme.text.primary} p-6`}
    >
      {/* Header */}
      <div className={`${theme.card} p-6 rounded-xl ${theme.border} border shadow-sm`}>
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-8 h-8" style={{ color: theme.text.primary }} />
          <div>
            <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>
              Help & Documentation
            </h1>
            <p className="text-sm mt-1" style={{ color: theme.text.muted }}>
              Everything you need to know about using the system
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            style={{ color: theme.text.muted }}
          />
          <input
            type="text"
            placeholder="Search help articles, FAQs, features..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg ${theme.border} border focus:outline-none focus:ring-2 focus:ring-purple-500`}
            style={{
              backgroundColor: theme.card,
              color: theme.text.primary
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className={`${theme.card} rounded-xl ${theme.border} border shadow-sm overflow-hidden`}>
        <div className="flex border-b" style={{ borderColor: theme.border }}>
          <button
            onClick={() => setActiveTab("getting-started")}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === "getting-started" ? `bg-gradient-to-r ${theme.accent} text-white` : ""
            }`}
            style={activeTab !== "getting-started" ? { color: theme.text.secondary } : {}}
          >
            <Book className="w-5 h-5 inline mr-2" />
            Getting Started
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === "features" ? `bg-gradient-to-r ${theme.accent} text-white` : ""
            }`}
            style={activeTab !== "features" ? { color: theme.text.secondary } : {}}
          >
            <Zap className="w-5 h-5 inline mr-2" />
            Features
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === "faq" ? `bg-gradient-to-r ${theme.accent} text-white` : ""
            }`}
            style={activeTab !== "faq" ? { color: theme.text.secondary } : {}}
          >
            <HelpCircle className="w-5 h-5 inline mr-2" />
            FAQ
          </button>
          <button
            onClick={() => setActiveTab("shortcuts")}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === "shortcuts" ? `bg-gradient-to-r ${theme.accent} text-white` : ""
            }`}
            style={activeTab !== "shortcuts" ? { color: theme.text.secondary } : {}}
          >
            <Keyboard className="w-5 h-5 inline mr-2" />
            Shortcuts
          </button>
        </div>

        <div className="p-6">
          {/* Getting Started Tab */}
          {activeTab === "getting-started" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
                  Quick Start Guide
                </h2>
                <p style={{ color: theme.text.secondary }}>
                  Follow these steps to get your business up and running in minutes
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gettingStartedSteps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-6 rounded-lg ${theme.border} border ${theme.hover} transition-all`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg bg-gradient-to-r ${theme.accent} bg-opacity-10`}
                        >
                          <Icon className="w-6 h-6" style={{ color: theme.text.primary }} />
                        </div>
                        <div className="flex-1">
                          <h3
                            className="font-bold text-lg mb-2"
                            style={{ color: theme.text.primary }}
                          >
                            {step.title}
                          </h3>
                          <p className="text-sm mb-3" style={{ color: theme.text.secondary }}>
                            {step.description}
                          </p>
                          <ul className="space-y-2">
                            {step.steps.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <Play
                                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                                  style={{ color: theme.text.muted }}
                                />
                                <span style={{ color: theme.text.secondary }}>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === "features" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
                  Feature Documentation
                </h2>
                <p style={{ color: theme.text.secondary }}>
                  Comprehensive guide to all available features
                </p>
              </div>

              <div className="space-y-6">
                {features.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className={`p-6 rounded-lg ${theme.border} border`}>
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className="w-6 h-6" style={{ color: theme.text.primary }} />
                        <h3 className="text-xl font-bold" style={{ color: theme.text.primary }}>
                          {feature.category}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {feature.items.map((item, i) => (
                          <div key={i} className={`p-4 rounded ${theme.hover} transition-colors`}>
                            <h4
                              className="font-semibold mb-1"
                              style={{ color: theme.text.primary }}
                            >
                              {item.name}
                            </h4>
                            <p className="text-sm" style={{ color: theme.text.secondary }}>
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === "faq" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
                  Frequently Asked Questions
                </h2>
                <p style={{ color: theme.text.secondary }}>
                  {searchQuery
                    ? `${filteredFaqs.length} results found`
                    : "Common questions and answers"}
                </p>
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    style={{ color: theme.text.muted }}
                  />
                  <p style={{ color: theme.text.muted }}>No FAQs found matching your search</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map(faq => (
                    <div
                      key={faq.id}
                      className={`${theme.border} border rounded-lg overflow-hidden`}
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className={`w-full px-6 py-4 flex items-center justify-between ${theme.hover} transition-colors`}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `${theme.accent.split(" ")[0]}20`,
                              color: theme.text.secondary
                            }}
                          >
                            {faq.category}
                          </span>
                          <span className="font-semibold" style={{ color: theme.text.primary }}>
                            {faq.question}
                          </span>
                        </div>
                        {expandedFaq === faq.id ? (
                          <ChevronUp className="w-5 h-5" style={{ color: theme.text.muted }} />
                        ) : (
                          <ChevronDown className="w-5 h-5" style={{ color: theme.text.muted }} />
                        )}
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-6 py-4 border-t" style={{ borderColor: theme.border }}>
                          <p style={{ color: theme.text.secondary }}>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shortcuts Tab */}
          {activeTab === "shortcuts" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
                  Keyboard Shortcuts
                </h2>
                <p style={{ color: theme.text.secondary }}>
                  Speed up your workflow with these handy shortcuts
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-lg ${theme.border} border`}
                  >
                    <span style={{ color: theme.text.secondary }}>{shortcut.action}</span>
                    <div className="flex items-center gap-2">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          <kbd
                            className="px-3 py-1 rounded font-mono text-sm font-semibold"
                            style={{
                              backgroundColor: theme.border,
                              color: theme.text.primary
                            }}
                          >
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span style={{ color: theme.text.muted }}>+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div className={`${theme.card} p-6 rounded-xl ${theme.border} border shadow-sm`}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>
          Need More Help?
        </h2>
        <p className="mb-6" style={{ color: theme.text.secondary }}>
          Can't find what you're looking for? Our support team is here to help!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${theme.hover} transition-colors text-center`}>
            <Mail className="w-8 h-8 mx-auto mb-2" style={{ color: theme.text.primary }} />
            <h3 className="font-semibold mb-1" style={{ color: theme.text.primary }}>
              Email Support
            </h3>
            <p className="text-sm mb-2" style={{ color: theme.text.secondary }}>
              Get help via email
            </p>
            <a
              href="mailto:support@example.com"
              className="text-sm font-medium"
              style={{ color: theme.text.primary }}
            >
              support@example.com
            </a>
          </div>
          <div className={`p-4 rounded-lg ${theme.hover} transition-colors text-center`}>
            <Phone className="w-8 h-8 mx-auto mb-2" style={{ color: theme.text.primary }} />
            <h3 className="font-semibold mb-1" style={{ color: theme.text.primary }}>
              Phone Support
            </h3>
            <p className="text-sm mb-2" style={{ color: theme.text.secondary }}>
              Call us directly
            </p>
            <a
              href="tel:+911234567890"
              className="text-sm font-medium"
              style={{ color: theme.text.primary }}
            >
              +91 123-456-7890
            </a>
          </div>
          <div className={`p-4 rounded-lg ${theme.hover} transition-colors text-center`}>
            <MessageCircle className="w-8 h-8 mx-auto mb-2" style={{ color: theme.text.primary }} />
            <h3 className="font-semibold mb-1" style={{ color: theme.text.primary }}>
              Live Chat
            </h3>
            <p className="text-sm mb-2" style={{ color: theme.text.secondary }}>
              Chat with our team
            </p>
            <button className="text-sm font-medium" style={{ color: theme.text.primary }}>
              Start Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

Help.displayName = "Help";

export default Help;
