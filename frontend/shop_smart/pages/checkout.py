import reflex as rx
from shop_smart.components.navbar import navbar
from shop_smart.components.footer import footer
from shop_smart.state.app_state import AppState
from shop_smart.style import (
    PRIMARY, SECONDARY, SUCCESS, TEXT_PRIMARY, TEXT_SECONDARY,
    BORDER_COLOR, BG_DARK, BG_CARD, BG_SURFACE, GRADIENT_PRIMARY,
)

STEPS = [1, 2, 3]
STEP_LABELS = ["Address", "Payment", "Confirm"]


def step_indicator() -> rx.Component:
    """3-step progress bar — built without rx.foreach on string labels."""
    def step_node(num: int, label: str) -> rx.Component:
        active = AppState.checkout_step >= num
        return rx.hstack(
            rx.vstack(
                rx.box(
                    rx.text(str(num), color="white", font_weight="700", font_size="14px"),
                    width="38px",
                    height="38px",
                    border_radius="50%",
                    background=rx.cond(active, GRADIENT_PRIMARY, BG_SURFACE),
                    border=f"2px solid {PRIMARY}",
                    display="flex",
                    align_items="center",
                    justify_content="center",
                ),
                rx.text(label, font_size="12px", color=rx.cond(active, TEXT_PRIMARY, TEXT_SECONDARY),
                        font_weight=rx.cond(active, "600", "400")),
                align="center",
                spacing="1",
            ),
            spacing="0",
        )

    def connector(num: int) -> rx.Component:
        return rx.box(
            width="60px",
            height="2px",
            background=rx.cond(AppState.checkout_step > num, PRIMARY, BORDER_COLOR),
            margin_top="-20px",   # align with circle centers
        )

    return rx.center(
        rx.hstack(
            step_node(1, "Address"),
            connector(1),
            step_node(2, "Payment"),
            connector(2),
            step_node(3, "Confirm"),
            spacing="2",
            align="center",
        ),
        width="100%",
        padding_y="8",
    )


def address_step() -> rx.Component:
    field_pairs = [
        ("Full Name *",      "name",    "Ravi Kumar"),
        ("Phone Number *",   "phone",   "+91 9876543210"),
        ("Address Line 1 *", "line1",   "123 Main Street"),
        ("Address Line 2",   "line2",   "Apt 4B (optional)"),
        ("City",             "city",    "Chennai"),
        ("State",            "state",   "Tamil Nadu"),
        ("Pincode",          "pincode", "600001"),
    ]
    return rx.vstack(
        rx.text("Delivery Address", font_size="20px", font_weight="700", color=TEXT_PRIMARY),
        rx.grid(
            *[
                rx.vstack(
                    rx.text(label, font_size="12px", color=TEXT_SECONDARY),
                    rx.input(
                        placeholder=placeholder,
                        background=BG_SURFACE,
                        border=f"1px solid {BORDER_COLOR}",
                        color=TEXT_PRIMARY,
                        border_radius="10px",
                        _placeholder={"color": TEXT_SECONDARY},
                        width="100%",
                    ),
                    align_items="start",
                    spacing="1",
                    width="100%",
                )
                for label, _field, placeholder in field_pairs
            ],
            columns=rx.breakpoints(initial="1", sm="2"),
            spacing="4",
            width="100%",
        ),
        rx.button(
            "Continue to Payment →",
            on_click=AppState.set_checkout_step(2),
            background=GRADIENT_PRIMARY,
            color="white",
            width="100%",
            size="3",
            border_radius="12px",
            font_weight="600",
        ),
        width="100%",
        spacing="5",
    )


def payment_step() -> rx.Component:
    return rx.vstack(
        rx.text("Payment Method", font_size="20px", font_weight="700", color=TEXT_PRIMARY),
        rx.tabs.root(
            rx.tabs.list(
                rx.tabs.trigger("💳 Card", value="card"),
                rx.tabs.trigger("📱 UPI", value="upi"),
                rx.tabs.trigger("🏦 Net Banking", value="netbanking"),
                rx.tabs.trigger("💵 COD", value="cod"),
            ),
            rx.tabs.content(
                rx.vstack(
                    rx.input(placeholder="Card Number (16 digits)", background=BG_SURFACE,
                             border=f"1px solid {BORDER_COLOR}", color=TEXT_PRIMARY,
                             border_radius="10px", width="100%",
                             _placeholder={"color": TEXT_SECONDARY}),
                    rx.hstack(
                        rx.input(placeholder="MM / YY", background=BG_SURFACE,
                                 border=f"1px solid {BORDER_COLOR}", color=TEXT_PRIMARY,
                                 border_radius="10px", flex="1",
                                 _placeholder={"color": TEXT_SECONDARY}),
                        rx.input(placeholder="CVV", background=BG_SURFACE,
                                 border=f"1px solid {BORDER_COLOR}", color=TEXT_PRIMARY,
                                 border_radius="10px", flex="1",
                                 _placeholder={"color": TEXT_SECONDARY}),
                        spacing="3", width="100%",
                    ),
                    rx.input(placeholder="Name on Card", background=BG_SURFACE,
                             border=f"1px solid {BORDER_COLOR}", color=TEXT_PRIMARY,
                             border_radius="10px", width="100%",
                             _placeholder={"color": TEXT_SECONDARY}),
                    spacing="3",
                ),
                value="card",
                padding_top="4",
            ),
            rx.tabs.content(
                rx.input(placeholder="Enter UPI ID (e.g. name@ybl)", background=BG_SURFACE,
                         border=f"1px solid {BORDER_COLOR}", color=TEXT_PRIMARY,
                         border_radius="10px", width="100%",
                         _placeholder={"color": TEXT_SECONDARY}),
                value="upi",
                padding_top="4",
            ),
            rx.tabs.content(
                rx.select(
                    ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra"],
                    placeholder="Select your bank...",
                    background=BG_SURFACE,
                    color=TEXT_PRIMARY,
                    width="100%",
                    size="2",
                ),
                value="netbanking",
                padding_top="4",
            ),
            rx.tabs.content(
                rx.hstack(
                    rx.icon("info", color=PRIMARY, size=18),
                    rx.text("Cash will be collected at the time of delivery.", color=TEXT_SECONDARY,
                            font_size="14px"),
                    align="center",
                    spacing="2",
                ),
                value="cod",
                padding_top="4",
            ),
            default_value="card",
            width="100%",
        ),
        # Order total summary
        rx.box(
            rx.hstack(
                rx.text("Grand Total:", color=TEXT_SECONDARY, font_size="15px"),
                rx.spacer(),
                rx.text("₹", AppState.grand_total, font_weight="800", font_size="22px", color=PRIMARY),
                width="100%",
                align="center",
            ),
            padding="16px",
            background=f"rgba(108,99,255,0.08)",
            border=f"1px solid {BORDER_COLOR}",
            border_radius="12px",
            width="100%",
        ),
        rx.button(
            rx.cond(
                AppState.is_loading,
                rx.spinner(size="2"),
                rx.hstack(rx.icon("lock", size=16), rx.text("Pay Securely"), spacing="2", align="center"),
            ),
            on_click=AppState.place_order,
            loading=AppState.is_loading,
            background=GRADIENT_PRIMARY,
            color="white",
            width="100%",
            size="3",
            border_radius="12px",
            font_weight="700",
        ),
        width="100%",
        spacing="5",
    )


def confirmation_step() -> rx.Component:
    return rx.center(
        rx.vstack(
            # Success icon
            rx.box(
                rx.icon("circle-check", color="white", size=48),
                width="90px",
                height="90px",
                border_radius="50%",
                background=f"linear-gradient(135deg, {SUCCESS}, #2BC0A0)",
                display="flex",
                align_items="center",
                justify_content="center",
                box_shadow=f"0 0 40px rgba(67,217,173,0.4)",
            ),
            rx.text("Order Confirmed! 🎉", font_size="28px", font_weight="800", color=TEXT_PRIMARY),
            rx.vstack(
                rx.hstack(
                    rx.text("Order ID:", color=TEXT_SECONDARY, font_size="14px"),
                    rx.text(AppState.current_order_id, font_weight="700", color=PRIMARY, font_size="14px"),
                    spacing="2",
                ),
                rx.hstack(
                    rx.text("Estimated Delivery:", color=TEXT_SECONDARY, font_size="14px"),
                    rx.text("5-7 Business Days", font_weight="600", color=TEXT_PRIMARY, font_size="14px"),
                    spacing="2",
                ),
                align="center",
                spacing="2",
            ),
            rx.hstack(
                rx.link(
                    rx.button("View Orders", variant="outline", color_scheme="violet", border_radius="10px"),
                    href="/profile",
                ),
                rx.link(
                    rx.button("Continue Shopping", background=GRADIENT_PRIMARY, color="white",
                              border_radius="10px"),
                    href="/products",
                ),
                spacing="4",
            ),
            align="center",
            spacing="5",
            padding="40px",
            background=BG_CARD,
            border_radius="20px",
            border=f"2px solid {SUCCESS}",
            max_width="500px",
            width="100%",
        ),
        width="100%",
        padding_y="40px",
    )


def checkout() -> rx.Component:
    return rx.box(
        navbar(),
        rx.container(
            rx.vstack(
                step_indicator(),
                rx.center(
                    rx.box(
                        rx.cond(AppState.checkout_step == 1, address_step(), rx.fragment()),
                        rx.cond(AppState.checkout_step == 2, payment_step(), rx.fragment()),
                        rx.cond(AppState.checkout_step == 3, confirmation_step(), rx.fragment()),
                        width=rx.breakpoints(initial="100%", md="640px"),
                        background=BG_CARD,
                        border=f"1px solid {BORDER_COLOR}",
                        border_radius="20px",
                        padding="32px",
                    ),
                    width="100%",
                ),
                max_width="800px",
                width="100%",
                padding_y="8",
                spacing="4",
            ),
        ),
        footer(),
        background=BG_DARK,
        min_height="100vh",
    )
