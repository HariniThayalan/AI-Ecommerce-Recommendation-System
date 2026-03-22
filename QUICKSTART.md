# Quick Start Guide - ShopSmart Recommendations

## 🎯 Quick Setup (Windows)

### Option 1: Automated Setup (Easiest)

1. Double-click `setup.bat` to install all dependencies
2. Double-click `start-backend.bat` to start the API server
3. Double-click `start-frontend.bat` to start the web app (in a new terminal)
4. Open your browser to `http://localhost:3000`

### Option 2: Manual Setup

#### Step 1: Install Backend Dependencies
```bash
pip install -r requirements.txt
```

#### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

#### Step 3: Start Backend Server
```bash
uvicorn main:app --reload
```

#### Step 4: Start Frontend (in a new terminal)
```bash
cd frontend
npm run dev
```

## 🎮 Using the Application

### Content-Based Recommendations
- **Purpose**: Find products similar to a specific product
- **How to use**:
  1. Go to "Content Based" tab
  2. Enter a Product ID (try IDs from your dataset)
  3. Click "Find Similar"
  4. View similar products based on features and tags

### Collaborative Filtering
- **Purpose**: Get personalized recommendations for a user
- **How to use**:
  1. Go to "Collaborative" tab
  2. Enter a User ID (try IDs from your dataset)
  3. Click "Get Recommendations"
  4. View recommended products with predicted ratings
  5. Check Precision@5 and Recall@5 metrics at the bottom

### Top Rated Products
- **Purpose**: See the highest-rated products overall
- **How to use**:
  1. Go to "Top Rated" tab
  2. Click "Load Top Products"
  3. View a grid of top-rated products with star ratings

## 🔧 Troubleshooting

### Backend won't start
- Make sure Python 3.8+ is installed: `python --version`
- Ensure `cleaned_data.csv` exists in the root directory
- Check if port 8000 is available

### Frontend won't start
- Make sure Node.js 16+ is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Check if port 3000 is available

### "Product not found" or "User not found"
- Try different IDs from your dataset
- Check `cleaned_data.csv` to see valid Product IDs and User IDs

### Connection errors
- Ensure backend is running on port 8000
- Check browser console for errors
- Verify CORS is enabled in `main.py`

## 📊 Example IDs to Try

To find valid IDs in your dataset, you can:

1. Open `cleaned_data.csv` in Excel or a text editor
2. Look at the "ProdID" column for product IDs
3. Look at the "User's ID" column for user IDs
4. Use those IDs in the application

## 🎨 Features Showcase

### Modern UI Components
- **Animated Cards**: Products fade in smoothly
- **Loading Skeletons**: Shimmer effect while loading
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Error Handling**: Friendly error messages with retry options

### Performance
- **Fast Loading**: Models built once on startup
- **Smooth Navigation**: Client-side routing with React Router
- **Optimized Requests**: Efficient API calls with loading states

## 📱 Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## 🔍 API Documentation

Once the backend is running, visit:
- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## 💡 Tips

1. **Start Backend First**: Always start the backend before the frontend
2. **Check Console**: If something doesn't work, check the browser console and terminal for errors
3. **Refresh Models**: Restart the backend to reload data and rebuild models
4. **Multiple Terminals**: You need two terminals running simultaneously (backend + frontend)

## 🆘 Need Help?

Common commands:
```bash
# Check Python version
python --version

# Check Node version
node --version

# Check npm version
npm --version

# Install a package globally
npm install -g <package>

# Clear npm cache
npm cache clean --force
```

---

Enjoy exploring recommendations! 🚀
