import reflex as rx
from shop_smart.components.navbar import navbar
from shop_smart.components.footer import footer
from shop_smart.components.product_card import product_card
from shop_smart.state.app_state import AppState
from shop_smart.style import (
    PRIMARY, SECONDARY, SUCCESS, TEXT_PRIMARY, TEXT_SECONDARY,
    BORDER_COLOR, BG_DARK, BG_CARD, BG_SURFACE, GRADIENT_PRIMARY,
)

MOCK_ORDERS = [
    {"id": "ORD-842A9XZ", "date": "March 12, 2026", "status": "Delivered", "total": "₹28,490", "items": "3"},
    {"id": "ORD-721B5YW", "date": "March 05, 2026", "status": "Delivered", "total": "₹1,249", "items": "1"},
    {"id": "ORD-451X2MK", "date": "Feb 28, 2026",   "status": "Cancelled", "total": "₹4,190", "items": "2"},
]


def user_header() -> rx.Component:
    return rx.hstack(
        rx.box(
            rx.text(AppState.user_initial, color="white", font_weight="800", font_size="24px"),
            width="72px",
            height="72px",
            border_radius="50%",
            background=GRADIENT_PRIMARY,
            display="flex",
            align_items="center",
            justify_content="center",
            border=f"3px solid {PRIMARY}",
            box_shadow=f"0 0 20px rgba(108,99,255,0.4)",
        ),
        rx.vstack(
            rx.text(AppState.user_name, font_size="22px", font_weight="700", color=TEXT_PRIMARY),
            rx.text(AppState.user_email, color=TEXT_SECONDARY, font_size="14px"),
            rx.hstack(
                rx.badge("Verified User ✓", color_scheme="green", variant="soft", size="1"),
                rx.badge("AI Shopper", color_scheme="violet", variant="soft", size="1"),
                spacing="2",
            ),
            align_items="start",
            spacing="1",
        ),
        rx.spacer(),
        rx.button(
            rx.icon("log-out", size=16),
            "Logout",
            on_click=AppState.logout,
            variant="outline",
            color_scheme="red",
            border_radius="10px",
            size="2",
        ),
        width="100%",
        align="center",
        padding_y="8",
        flex_wrap="wrap",
        spacing="4",
    )


def orders_tab() -> rx.Component:
    return rx.vstack(
        rx.text("Order History", font_size="16px", font_weight="600", color=TEXT_PRIMARY),
        rx.foreach(
            MOCK_ORDERS,
            lambda order: rx.hstack(
                rx.vstack(
                    rx.text("Order ", order["id"], font_weight="600", color=TEXT_PRIMARY, font_size="14px"),
                    rx.text(order["date"], font_size="12px", color=TEXT_SECONDARY),
                    rx.text(order["items"], " item(s)", font_size="12px", color=TEXT_SECONDARY),
                    align_items="start",
                    spacing="0",
                ),
                rx.spacer(),
                rx.badge(
                    order["status"],
                    variant="solid",
                    color_scheme=rx.cond(order["status"] == "Delivered", "green", "red"),
                    size="2",
                ),
                rx.text(order["total"], font_weight="700", color=PRIMARY, width="90px", text_align="right"),
                rx.button(
                    "Details",
                    variant="ghost",
                    color_scheme="violet",
                    size="1",
                ),
                width="100%",
                padding="16px",
                background="rgba(255,255,255,0.02)",
                border_radius="12px",
                border=f"1px solid {BORDER_COLOR}",
                align="center",
                flex_wrap="wrap",
                spacing="3",
            ),
        ),
        width="100%",
        spacing="3",
    )


def wishlist_tab() -> rx.Component:
    return rx.cond(
        AppState.filtered_count == 0,
        rx.center(
            rx.vstack(
                rx.icon("heart", size=60, color=TEXT_SECONDARY),
                rx.text("Your wishlist is empty", color=TEXT_SECONDARY, font_size="16px"),
                rx.link(
                    rx.button("Browse Products", background=GRADIENT_PRIMARY, color="white", border_radius="10px"),
                    href="/products",
                ),
                align="center",
                spacing="4",
            ),
            padding_y="40px",
        ),
        rx.grid(
            rx.foreach(AppState.filtered_products, lambda p: product_card(p)),
            columns=rx.breakpoints(initial="1", sm="2", md="3", lg="4"),
            spacing="5",
            width="100%",
        ),
    )


def settings_tab() -> rx.Component:
    return rx.vstack(
        rx.text("Account Settings", font_size="16px", font_weight="600", color=TEXT_PRIMARY),
        rx.vstack(
            rx.text("Display Name", font_size="13px", color=TEXT_SECONDARY),
            rx.input(
                value=AppState.user_name,
                background=BG_SURFACE,
                border=f"1px solid {BORDER_COLOR}",
                color=TEXT_PRIMARY,
                border_radius="10px",
                width="100%",
            ),
            align_items="start",
            spacing="1",
            width="100%",
        ),
        rx.vstack(
            rx.text("Email Address", font_size="13px", color=TEXT_SECONDARY),
            rx.input(
                value=AppState.user_email,
                background=BG_SURFACE,
                border=f"1px solid {BORDER_COLOR}",
                color=TEXT_PRIMARY,
                border_radius="10px",
                width="100%",
            ),
            align_items="start",
            spacing="1",
            width="100%",
        ),
        rx.button(
            "Save Changes",
            background=GRADIENT_PRIMARY,
            color="white",
            border_radius="10px",
            size="2",
        ),
        spacing="4",
        width="100%",
        max_width="480px",
    )


def login_form() -> rx.Component:
    return rx.center(
        rx.vstack(
            rx.vstack(
                rx.box(
                    rx.icon("shopping-bag", color=PRIMARY, size=32),
                    width="64px", height="64px", border_radius="50%",
                    background=f"rgba(108,99,255,0.15)",
                    display="flex", align_items="center", justify_content="center",
                ),
                rx.text("Welcome Back", font_size="26px", font_weight="800", color=TEXT_PRIMARY),
                rx.text("Sign in to your ShopSmart AI account", color=TEXT_SECONDARY, font_size="14px"),
                align="center", spacing="3",
            ),
            rx.vstack(
                rx.text("User ID", color=TEXT_SECONDARY, font_size="13px"),
                rx.input(
                    placeholder="Enter your user ID",
                    width="100%",
                    background=BG_SURFACE,
                    border=f"1px solid {BORDER_COLOR}",
                    color=TEXT_PRIMARY,
                    border_radius="10px",
                    on_change=AppState.set_user_id,
                    _placeholder={"color": TEXT_SECONDARY},
                ),
                align_items="start", width="100%", spacing="1",
            ),
            rx.vstack(
                rx.text("Password", color=TEXT_SECONDARY, font_size="13px"),
                rx.input(
                    type="password",
                    placeholder="••••••••",
                    width="100%",
                    background=BG_SURFACE,
                    border=f"1px solid {BORDER_COLOR}",
                    color=TEXT_PRIMARY,
                    border_radius="10px",
                    on_change=AppState.set_password,
                    _placeholder={"color": TEXT_SECONDARY},
                ),
                align_items="start", width="100%", spacing="1",
            ),
            rx.button(
                "Sign In",
                on_click=AppState.handle_login,
                background=GRADIENT_PRIMARY,
                color="white",
                width="100%",
                size="3",
                border_radius="12px",
                font_weight="700",
            ),
            rx.hstack(
                rx.text("Demo: use any ID like", color=TEXT_SECONDARY, font_size="12px"),
                rx.text("user_01", color=PRIMARY, font_size="12px", font_weight="600"),
                spacing="1",
            ),
            padding="32px",
            background=BG_CARD,
            border=f"1px solid {BORDER_COLOR}",
            border_radius="24px",
            box_shadow="0 24px 48px rgba(0,0,0,0.4)",
            width=rx.breakpoints(initial="100%", sm="400px"),
            spacing="5",
            align_items="start",
        ),
        padding_y="60px",
        width="100%",
    )


def profile() -> rx.Component:
    return rx.box(
        navbar(),
        rx.container(
            rx.cond(
                AppState.is_logged_in,
                rx.vstack(
                    user_header(),
                    rx.tabs.root(
                        rx.tabs.list(
                            rx.tabs.trigger("📦 Orders", value="orders"),
                            rx.tabs.trigger("❤️ Wishlist", value="wishlist"),
                            rx.tabs.trigger("⚙️ Settings", value="settings"),
                        ),
                        rx.tabs.content(orders_tab(), value="orders", padding_y="6"),
                        rx.tabs.content(wishlist_tab(), value="wishlist", padding_y="6"),
                        rx.tabs.content(settings_tab(), value="settings", padding_y="6"),
                        default_value="orders",
                        width="100%",
                    ),
                    max_width="1200px",
                    width="100%",
                    padding_y="8",
                    spacing="6",
                ),
                login_form(),
            ),
        ),
        footer(),
        background=BG_DARK,
        min_height="100vh",
        on_mount=AppState.fetch_products,
    )
