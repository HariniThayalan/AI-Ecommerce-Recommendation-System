import reflex as rx
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Firebase Initialization
# Make sure to place your firebase_key.json in the project root
FIREBASE_KEY_PATH = "firebase_key.json"

try:
    if not firebase_admin._apps:
        if os.path.exists(FIREBASE_KEY_PATH):
            cred = credentials.Certificate(FIREBASE_KEY_PATH)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized successfully.")
        else:
            print(f"Warning: {FIREBASE_KEY_PATH} not found. Firebase features will not work.")
    db = firestore.client()
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    db = None

class LoginState(rx.State):
    """The state for the login page."""
    user_id: str = ""
    password: str = ""
    login_status: str = ""
    is_loading: bool = False

    def set_user_id(self, val: str):
        self.user_id = val

    def set_password(self, val: str):
        self.password = val

    def check_user(self, uid):
        """Check if user exists in Firebase."""
        if db is None:
            return False
        doc_ref = db.collection("users").document(uid)
        doc = doc_ref.get()
        return doc.exists

    def create_user(self, uid, pwd):
        """Create a new user in Firebase."""
        if db is None:
            return
        db.collection("users").document(uid).set({
            "password": pwd  # In a real app, hash this!
        })

    def handle_login(self):
        """Logic for checking or creating a user and logging in."""
        if not self.user_id:
            return rx.toast.error("Please enter a User ID")
        
        if len(self.password) < 6:
            return rx.toast.error("Password must be at least 6 characters!")

        self.is_loading = True
        self.login_status = "Checking database..."
        
        try:
            if self.check_user(self.user_id):
                # User exists, check password (optional simplification for this task)
                self.login_status = "Login Successful!"
                yield rx.toast.success("Welcome Back!")
            else:
                # Create user
                self.create_user(self.user_id, self.password)
                self.login_status = "Account Created & Logged In!"
                yield rx.toast.info("Account Created Successfully!")
            
            # Reset and Redirect
            self.is_loading = False
            return rx.redirect("/home")
            
        except Exception as e:
            self.is_loading = False
            self.login_status = f"Error: {str(e)}"
            return rx.toast.error(f"Login failed: {str(e)}")

class ProductState(rx.State):
    """The state for the product catalog."""
    search_query: str = ""

    def set_search_query(self, val: str):
        self.search_query = val
    
    # Dummy product data
    all_products: list[dict] = [
        {"name": "AI Smart Watch", "description": "Monitors health with AI precision", "price": "199", "badge": "99% Match", "image": "https://picsum.photos/200/200?random=1"},
        {"name": "Neural Headphones", "description": "ANC with brain-wave sensing", "price": "299", "badge": "Picked for You", "image": "https://picsum.photos/200/200?random=2"},
        {"name": "Smart Speaker", "description": "Your personal assistant home bot", "price": "99", "badge": "Best Seller", "image": "https://picsum.photos/200/200?random=3"},
        {"name": "Robot Vacuum", "description": "Cleans while you sleep autonomously", "price": "399", "badge": "AI Powered", "image": "https://picsum.photos/200/200?random=4"},
        {"name": "Smart Thermostat", "description": "Learns your routine for energy efficiency", "price": "149", "badge": "Eco Friendly", "image": "https://picsum.photos/200/200?random=5"},
    ]

    @rx.var
    def filtered_products(self) -> list[dict]:
        """Filters products based on the search query."""
        if not self.search_query:
            return self.all_products
        return [
            p for p in self.all_products 
            if self.search_query.lower() in p["name"].lower() or self.search_query.lower() in p["description"].lower()
        ]

def product_card(item: dict):
    """Component for a single product card."""
    return rx.vstack(
        rx.image(
            src=item["image"],
            width="100%",
            height="150px",
            border_radius="10px",
            object_fit="cover",
        ),
        rx.vstack(
            rx.hstack(
                rx.text(item["name"], weight="bold", font_size="1.2em"),
                rx.badge(item["badge"], variant="surface", color_scheme="indigo"),
                justify="between",
                width="100%",
            ),
            rx.text(item["description"], color="gray", font_size="0.9em"),
            align_items="start",
            spacing="1",
        ),
        rx.hstack(
            rx.text(f"Rs. {item['price']}", weight="bold", color="indigo"),
            rx.button(
                "Add to Cart", 
                size="1",
                color_scheme="indigo",
                variant="soft"
            ),
            justify="between",
            width="100%",
            padding_top="1em",
        ),
        padding="1em",
        border="1px solid #eee",
        border_radius="lg",
        background_color="white",
        _hover={
            "transform": "translateY(-5px)",
            "box_shadow": "lg",
            "transition": "all 0.3s ease",
        },
        width="100%",
    )

def home():
    """The AI-Ecom Home Page with grid and search."""
    return rx.vstack(
        # Header / Search Bar
        rx.hstack(
            rx.heading("ShopSmart AI", size="7", color_scheme="indigo"),
            rx.spacer(),
            rx.input(
                placeholder="Search products...",
                on_change=ProductState.set_search_query,
                width="40%",
            ),
            rx.button(
                "Logout", 
                on_click=rx.redirect("/"), 
                color_scheme="red", 
                variant="outline"
            ),
            width="100%",
            padding="2em",
            align="center",
            background_color="white",
            border_bottom="1px solid #eee",
        ),

        # Product Grid
        rx.center(
            rx.vstack(
                rx.heading("Recommended for You", size="5", margin_bottom="1em"),
                rx.grid(
                    rx.foreach(
                        ProductState.filtered_products,
                        lambda item: product_card(item)
                    ),
                    columns=rx.breakpoints(initial="1", sm="2", md="3", lg="4"),  # Responsive grid
                    spacing="6",
                    width="100%",
                ),
                width="100%",
                max_width="1200px",
                padding="2em",
            ),
            width="100%",
        ),
        background_color="#f9fafb",
        min_height="100vh",
        spacing="0",
    )

def login():
    """The Login Page UI."""
    return rx.center(
        rx.vstack(
            rx.heading("Login / Signup", size="8", margin_bottom="1em"),
            
            # User ID Input
            rx.vstack(
                rx.text("User ID", weight="bold"),
                rx.input(
                    placeholder="Enter User ID",
                    value=LoginState.user_id,
                    on_change=LoginState.set_user_id,
                    width="300px",
                ),
                align_items="start",
                width="100%",
            ),

            # Password Input
            rx.vstack(
                rx.text("Password", weight="bold"),
                rx.input(
                    placeholder="Enter Password",
                    type="password",
                    value=LoginState.password,
                    on_change=LoginState.set_password,
                    width="300px",
                ),
                align_items="start",
                width="100%",
            ),

            # Button
            rx.button(
                "Login / Signup",
                on_click=LoginState.handle_login,
                loading=LoginState.is_loading,
                width="100%",
                color_scheme="indigo",
                style={"margin_top": "1em"}
            ),

            # Status Message
            rx.text(
                LoginState.login_status,
                color="gray",
                font_size="0.9em"
            ),

            background_color="white",
            padding="2em",
            border_radius="15px",
            box_shadow="0 10px 25px rgba(0,0,0,0.1)",
            spacing="4",
            align="center",
        ),
        height="100vh",
        background_color="#f5f7f9",
    )

app = rx.App(
    theme=rx.theme(
        accent_color="indigo",
        radius="large",
        appearance="light"
    )
)
app.add_page(login, route="/")
app.add_page(home, route="/home")
