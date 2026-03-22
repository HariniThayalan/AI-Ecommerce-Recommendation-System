import reflex as rx
from shop_smart.pages.landing import landing
from shop_smart.pages.products import products
from shop_smart.pages.product_detail import product_detail
from shop_smart.pages.cart import cart
from shop_smart.pages.checkout import checkout
from shop_smart.pages.profile import profile

app = rx.App(
    theme=rx.theme(
        appearance="dark",
        accent_color="violet",
        radius="large",
    )
)

app.add_page(landing,        route="/")
app.add_page(products,       route="/products")
app.add_page(product_detail, route="/product")   # /product/[id] when dynamic routing added
app.add_page(cart,           route="/cart")
app.add_page(checkout,       route="/checkout")
app.add_page(profile,        route="/profile")
