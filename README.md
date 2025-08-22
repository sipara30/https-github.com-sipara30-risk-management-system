# Risk Management Dashboard

A modern, interactive React application for enterprise risk management with real-time data visualization and comprehensive risk tracking capabilities.

## 🚀 Features

### Interactive Risk Management
- **Add New Risks**: Create comprehensive risk entries with detailed information
- **Edit Existing Risks**: Modify risk details, status, and metadata
- **Delete Risks**: Remove risks with confirmation dialogs
- **Status Updates**: Change risk status directly from the dashboard (Open, In Progress, Resolved, Closed)

### Advanced Filtering & Search
- **Real-time Search**: Search across risk titles, descriptions, and owners
- **Multi-criteria Filtering**: Filter by status, severity, and category
- **Clear Filters**: Reset all filters with one click
- **Dynamic Results**: See filtered results update instantly

### Risk Categories & Severity Levels
- **Categories**: Technical, Operational, Financial, Strategic, Compliance, Security
- **Severity Levels**: Low, Medium, High, Critical with color-coded indicators
- **Visual Indicators**: Color-coded badges for quick risk assessment

### Data Visualization
- **Interactive Charts**: Bar charts showing risks by status and severity
- **Real-time Updates**: Charts update automatically when data changes
- **Responsive Design**: Charts adapt to different screen sizes

### Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional design with Tailwind CSS
- **Interactive Elements**: Hover effects, transitions, and smooth animations
- **User-friendly Navigation**: Intuitive layout with clear visual hierarchy

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Build Tool**: Vite
- **Package Manager**: npm

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd risk-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 🎯 How to Use

### Adding a New Risk
1. Click the "Add New Risk" button in the top-right corner
2. Fill in the required fields (Title and Description)
3. Select appropriate category, severity, and status
4. Add owner information and due date (optional)
5. Include additional notes if needed
6. Click "Add Risk" to save

### Editing a Risk
1. Click the "Edit" button on any risk card
2. Modify the desired fields
3. Click "Update Risk" to save changes

### Filtering and Searching
1. Use the search bar to find risks by title, description, or owner
2. Use dropdown filters to narrow by status, severity, or category
3. Click "Clear Filters" to reset all filters

### Managing Risk Status
1. Expand a risk card by clicking "Show More"
2. Use the status dropdown to change the risk status
3. Changes are saved automatically

### Viewing Analytics
- Charts automatically display at the top of the dashboard
- View risk distribution by status and severity
- Charts update in real-time as you modify risks

## 📊 Sample Data

The application comes pre-loaded with sample risks covering various scenarios:
- Data Breach Risk (Security, High severity)
- Server Downtime (Technical, Medium severity)
- Budget Overrun (Financial, Medium severity)
- Compliance Violation (Compliance, Critical severity)
- Key Personnel Loss (Operational, High severity)

## 🎨 Customization

### Adding New Categories
Edit the `RiskForm.jsx` and `RiskFilters.jsx` files to add new risk categories.

### Modifying Severity Levels
Update the severity options in the form components and adjust color schemes in `RiskCard.jsx`.

### Styling Changes
Modify Tailwind CSS classes throughout the components to match your brand colors and design preferences.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using React and Tailwind CSS** 