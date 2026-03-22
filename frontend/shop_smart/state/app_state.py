"""
shop_smart/state/app_state.py

Split into 5 focused sub-states. Each inherits from rx.State independently.
AppState remains as a thin backwards-compat alias used by legacy code.
"""
import reflex as rx
import httpx

API_BASE = "http://localhost:8001"


# ── Auth State ─────────────────────────────────────────────────────────────────
class AuthState(rx.State):
    user_id: str = "user_demo_01"
    user_name: str = "Demo User"
    user_email: str = "demo@shopsmart.ai"
    password: str = ""
    is_logged_in: bool = False

    def set_user_id(self, val: str):
        self.user_id = val

    def set_password(self, val: str):
        self.password = val

    def handle_login(self):
        if not self.user_id:
            return rx.toast.error("Please enter a User ID")
        self.user_name = self.user_id.replace("_", " ").title()
        self.is_logged_in = True
        return rx.toast.success(f"Welcome back, {self.user_name}!")

    def logout(self):
        self.is_logged_in = False
        self.user_id = "user_demo_01"
        self.password = ""
        self.user_name = "Demo User"
        return rx.redirect("/")

    @rx.var
    def user_initial(self) -> str:
        return self.user_name[0].upper() if self.user_name else "U"


# ── Product & Filter State ─────────────────────────────────────────────────────
class ProductState(rx.State):
    all_products: list[dict] = []
    filtered_products: list[dict] = []
    current_product: dict = {}
    recommendation_mode: str = "top_rated"
    search_query: str = ""
    selected_category: str = "All"
    price_range: list[int] = [0, 100000]
    min_rating: float = 0.0
    is_loading: bool = False
    sort_by: str = "relevance"

    async def fetch_products(self):
        self.is_loading = True
        yield
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(f"{API_BASE}/products", params={"limit": 100})
                if resp.status_code == 200:
                    data = resp.json()
                    # Support both {"products": [...]} and plain list responses
                    prods = data.get("products", data) if isinstance(data, dict) else data
                    self.all_products = prods
                    self.filtered_products = prods
                else:
                    yield rx.toast.error(f"API error {resp.status_code}")
        except Exception as e:
            yield rx.toast.error(f"Backend unreachable: {e}")
        finally:
            self.is_loading = False

    async def load_recommendations(self):
        self.is_loading = True
        yield
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                mode = self.recommendation_mode
                user_id = AuthState.user_id
                pid = self.current_product.get("id", "")

                if mode == "top_rated" or not pid:
                    r = await client.get(f"{API_BASE}/recommend/top-rated", params={"top_n": 50})
                    data = r.json()
                    self.filtered_products = data.get("recommendations", data) if isinstance(data, dict) else data
                elif mode == "content":
                    r = await client.get(f"{API_BASE}/recommend/content/{pid}", params={"top_n": 20})
                    data = r.json()
                    self.filtered_products = data.get("recommendations", data) if isinstance(data, dict) else data
                elif mode == "collaborative":
                    r = await client.get(f"{API_BASE}/recommend/collaborative/{user_id}", params={"top_n": 20})
                    data = r.json()
                    self.filtered_products = data.get("recommendations", data) if isinstance(data, dict) else data
                else:
                    r = await client.get(f"{API_BASE}/recommend/hybrid/{user_id}/{pid}", params={"top_n": 20})
                    data = r.json()
                    self.filtered_products = data.get("recommendations", data) if isinstance(data, dict) else data
        except Exception:
            # Fall back to local filter
            self._apply_local_filters()
        finally:
            self.is_loading = False

    def set_search_query(self, q: str):
        self.search_query = q
        self._apply_local_filters()

    def set_category(self, cat: str):
        self.selected_category = cat
        self._apply_local_filters()

    def set_price_range(self, val: list[int]):
        self.price_range = val
        self._apply_local_filters()

    def set_min_rating(self, val: str):
        try:
            self.min_rating = 0.0 if "Any" in val else float(val.split("+")[0])
        except Exception:
            self.min_rating = 0.0
        self._apply_local_filters()

    def set_recommendation_mode(self, mode: str):
        self.recommendation_mode = mode
        return ProductState.load_recommendations

    def set_sort(self, sort: str):
        self.sort_by = sort

    def _apply_local_filters(self):
        results = list(self.all_products)
        if self.search_query:
            q = self.search_query.lower()
            results = [
                p for p in results
                if q in str(p.get("name", "")).lower()
                or q in str(p.get("brand", "")).lower()
                or q in str(p.get("category", "")).lower()
            ]
        if self.selected_category and self.selected_category != "All":
            results = [p for p in results if p.get("category") == self.selected_category]
        lo, hi = self.price_range[0], self.price_range[1]
        results = [p for p in results if lo <= float(p.get("final_price", 0)) <= hi]
        if self.min_rating > 0:
            results = [p for p in results if float(p.get("avg_rating", 0)) >= self.min_rating]
        self.filtered_products = results

    def apply_filters(self):
        self._apply_local_filters()

    def toggle_category(self, category: str):
        self.selected_category = category
        self._apply_local_filters()

    @rx.var
    def recommended_products(self) -> list[dict]:
        return self.filtered_products[:4]

    @rx.var
    def filtered_count(self) -> int:
        return len(self.filtered_products)

    @rx.var
    def show_ai_badge(self) -> bool:
        return self.recommendation_mode != "top_rated"


# ── Cart State ─────────────────────────────────────────────────────────────────
class CartState(rx.State):
    cart_items: list[dict] = []
    coupon_code: str = ""
    discount_amount: float = 0.0

    def set_coupon_code(self, code: str):
        self.coupon_code = code

    def add_to_cart(self, product: dict):
        for item in self.cart_items:
            if item["id"] == product["id"]:
                item["quantity"] = item["quantity"] + 1
                self.cart_items = list(self.cart_items)  # trigger reactivity
                return rx.toast.success("Quantity updated!")
        new_item = {**product, "quantity": 1}
        self.cart_items = [*self.cart_items, new_item]
        return rx.toast.success("Added to cart!")

    def remove_from_cart(self, product_id: str):
        self.cart_items = [i for i in self.cart_items if i["id"] != product_id]

    def update_quantity(self, product_id: str, delta: int):
        updated = []
        for item in self.cart_items:
            if item["id"] == product_id:
                new_qty = item["quantity"] + delta
                if new_qty > 0:
                    updated.append({**item, "quantity": new_qty})
            else:
                updated.append(item)
        self.cart_items = updated

    def apply_coupon(self):
        code = self.coupon_code.upper()
        if code == "SAVE10":
            self.discount_amount = round(self.cart_subtotal * 0.10, 2)
            return rx.toast.success(f"10% discount applied!")
        elif code == "FIRST50":
            self.discount_amount = 50.0
            return rx.toast.success("₹50 flat discount applied!")
        else:
            self.discount_amount = 0.0
            return rx.toast.error("Invalid coupon code.")

    @rx.var
    def cart_count(self) -> int:
        return sum(int(i.get("quantity", 0)) for i in self.cart_items)

    @rx.var
    def cart_subtotal(self) -> float:
        return round(
            sum(float(i.get("final_price", 0)) * int(i.get("quantity", 1)) for i in self.cart_items),
            2,
        )

    # Keep cart_total as alias for compatibility
    @rx.var
    def cart_total(self) -> float:
        return self.cart_subtotal

    @rx.var
    def gst_amount(self) -> float:
        return round((self.cart_subtotal - self.discount_amount) * 0.18, 2)

    @rx.var
    def grand_total(self) -> float:
        return round((self.cart_subtotal - self.discount_amount) * 1.18, 2)

    @rx.var
    def is_cart_empty(self) -> bool:
        return len(self.cart_items) == 0


# ── Wishlist State ─────────────────────────────────────────────────────────────
class WishlistState(rx.State):
    wishlist_ids: list[str] = []

    def toggle_wishlist(self, product_id: str):
        if product_id in self.wishlist_ids:
            self.wishlist_ids = [i for i in self.wishlist_ids if i != product_id]
            return rx.toast.info("Removed from wishlist.")
        else:
            self.wishlist_ids = [*self.wishlist_ids, product_id]
            return rx.toast.success("Added to wishlist!")

    # Keep toggle as alias
    def toggle(self, product_id: str):
        return self.toggle_wishlist(product_id)

    @rx.var
    def wishlist_count(self) -> int:
        return len(self.wishlist_ids)


# ── Checkout State ─────────────────────────────────────────────────────────────
class CheckoutState(rx.State):
    checkout_step: int = 1
    payment_method: str = "card"
    current_order_id: str = ""
    is_processing: bool = False
    coupon_code: str = ""

    def set_checkout_step(self, step: int):
        self.checkout_step = step

    def set_payment_method(self, val: str):
        self.payment_method = val

    def go_to_payment(self):
        self.checkout_step = 2

    async def place_order(self):
        self.is_processing = True
        yield
        import asyncio, random, string
        await asyncio.sleep(1.5)
        order_id = "ORD-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
        self.current_order_id = order_id
        self.checkout_step = 3
        self.is_processing = False
        yield rx.toast.success("Order placed successfully!")

    def reset_checkout(self):
        self.checkout_step = 1
        self.current_order_id = ""
        self.is_processing = False


# ── AppState — backwards-compatible monolith alias ────────────────────────────
# Existing pages still import AppState; we keep it as a single class
# that delegates to the sub-states via inheritance.
class AppState(rx.State):
    """Legacy monolith kept for backwards compatibility during migration."""

    # Auth
    user_id: str = "user_demo_01"
    password: str = ""
    user_name: str = "Demo User"
    user_email: str = "demo@shopsmart.ai"
    is_logged_in: bool = False

    # Products
    all_products: list[dict] = []
    filtered_products: list[dict] = []
    recommendation_mode: str = "top_rated"
    search_query: str = ""
    selected_category: list[str] = []
    price_range: list[int] = [0, 100000]
    min_rating: float = 0.0
    is_loading: bool = False
    selected_product_id: str = ""

    # Cart
    cart_items: list[dict] = []
    cart_count: int = 0
    cart_total: float = 0.0
    wishlist_ids: list[str] = []

    # Checkout
    checkout_step: int = 1
    payment_method: str = "card"
    current_order_id: str = ""
    coupon_code: str = ""
    discount_amount: float = 0.0

    # ── Computed vars ──────────────────────────────────────────────────────────
    @rx.var
    def user_initial(self) -> str:
        return self.user_name[0].upper() if self.user_name else "U"

    @rx.var
    def recommended_products(self) -> list[dict]:
        return self.filtered_products[:4]

    @rx.var
    def filtered_count(self) -> int:
        return len(self.filtered_products)

    @rx.var
    def gst_amount(self) -> float:
        return round((self.cart_total - self.discount_amount) * 0.18, 2)

    @rx.var
    def grand_total(self) -> float:
        return round((self.cart_total - self.discount_amount) * 1.18, 2)

    # ── Setters ────────────────────────────────────────────────────────────────
    def set_search_query(self, query: str):
        self.search_query = query

    def set_coupon_code(self, code: str):
        self.coupon_code = code

    def set_price_range(self, val: list[int]):
        self.price_range = val

    def set_payment_method(self, val: str):
        self.payment_method = val

    def set_checkout_step(self, step: int):
        self.checkout_step = step

    def set_selected_category(self, categories: list[str]):
        self.selected_category = categories

    def set_user_id(self, val: str):
        self.user_id = val

    def set_password(self, val: str):
        self.password = val

    def set_recommendation_mode(self, mode: str):
        self.recommendation_mode = mode
        return AppState.fetch_products

    def set_min_rating(self, val: str):
        try:
            self.min_rating = 0.0 if "Any" in val else float(val.split("+")[0])
        except Exception:
            self.min_rating = 0.0

    # ── Actions ────────────────────────────────────────────────────────────────
    async def fetch_products(self):
        self.is_loading = True
        yield
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(f"{API_BASE}/products", params={"limit": 100})
                if resp.status_code == 200:
                    data = resp.json()
                    prods = data.get("products", data) if isinstance(data, dict) else data
                    self.all_products = prods
                    self.apply_filters()
                else:
                    yield rx.toast.error(f"API error {resp.status_code}")
        except Exception as e:
            yield rx.toast.error(f"Backend unreachable. Is FastAPI running?")
        finally:
            self.is_loading = False

    def apply_filters(self):
        results = list(self.all_products)
        if self.selected_category:
            results = [p for p in results if p.get("category") in self.selected_category]
        if self.search_query:
            q = self.search_query.lower()
            results = [
                p for p in results
                if q in str(p.get("name", "")).lower()
                or q in str(p.get("brand", "")).lower()
            ]
        lo, hi = self.price_range[0], self.price_range[1]
        results = [p for p in results if lo <= float(p.get("final_price", 0)) <= hi]
        if self.min_rating > 0:
            results = [p for p in results if float(p.get("avg_rating", 0)) >= self.min_rating]
        self.filtered_products = results

    def toggle_category(self, category: str):
        if category in self.selected_category:
            self.selected_category = [c for c in self.selected_category if c != category]
        else:
            self.selected_category = [*self.selected_category, category]
        self.apply_filters()

    def add_to_cart(self, product: dict):
        for item in self.cart_items:
            if item["id"] == product["id"]:
                item["quantity"] = item["quantity"] + 1
                self.cart_items = list(self.cart_items)
                self._update_cart_totals()
                return rx.toast.success("Quantity updated!")
        self.cart_items = [*self.cart_items, {**product, "quantity": 1}]
        self._update_cart_totals()
        return rx.toast.success("Added to cart!")

    def remove_from_cart(self, product_id: str):
        self.cart_items = [i for i in self.cart_items if i["id"] != product_id]
        self._update_cart_totals()

    def update_quantity(self, product_id: str, delta: int):
        updated = []
        for item in self.cart_items:
            if item["id"] == product_id:
                new_qty = item["quantity"] + delta
                if new_qty > 0:
                    updated.append({**item, "quantity": new_qty})
            else:
                updated.append(item)
        self.cart_items = updated
        self._update_cart_totals()

    def _update_cart_totals(self):
        self.cart_count = sum(int(i.get("quantity", 0)) for i in self.cart_items)
        self.cart_total = round(
            sum(float(i.get("final_price", 0)) * int(i.get("quantity", 1)) for i in self.cart_items),
            2,
        )

    def toggle_wishlist(self, product_id: str):
        if product_id in self.wishlist_ids:
            self.wishlist_ids = [i for i in self.wishlist_ids if i != product_id]
            return rx.toast.info("Removed from wishlist.")
        self.wishlist_ids = [*self.wishlist_ids, product_id]
        return rx.toast.success("Added to wishlist!")

    def apply_coupon(self):
        code = self.coupon_code.upper()
        if code == "SAVE10":
            self.discount_amount = round(self.cart_total * 0.10, 2)
            return rx.toast.success("10% discount applied!")
        elif code == "FIRST50":
            self.discount_amount = 50.0
            return rx.toast.success("₹50 flat discount applied!")
        else:
            self.discount_amount = 0.0
            return rx.toast.error("Invalid coupon code.")

    async def place_order(self):
        self.is_loading = True
        yield
        import asyncio, random, string
        await asyncio.sleep(1.5)
        order_id = "ORD-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
        self.current_order_id = order_id
        self.checkout_step = 3
        self.is_loading = False
        yield rx.toast.success(f"Order placed!")

    def handle_login(self):
        if not self.user_id:
            return rx.toast.error("Please enter a User ID")
        self.user_name = self.user_id.replace("_", " ").title()
        self.is_logged_in = True
        return rx.redirect("/")

    def logout(self):
        self.is_logged_in = False
        self.user_id = "user_demo_01"
        self.password = ""
        return rx.redirect("/")
