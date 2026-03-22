import reflex as rx
from shop_smart.components.navbar import navbar
from shop_smart.components.footer import footer
from shop_smart.state.app_state import AppState
from shop_smart.style import (
    PRIMARY, SECONDARY, SUCCESS, TEXT_PRIMARY, TEXT_SECONDARY,
    BORDER_COLOR, BG_DARK, BG_CARD, BG_SURFACE, GRADIENT_PRIMARY,
)


def cart_item(item: dict) -> rx.Component:
    return rx.hstack(
        rx.image(
            src=item["image_url"],
            width="72px",
            height="72px",
            object_fit="cover",
            border_radius="10px",
            flex_shrink="0",
        ),
        rx.vstack(
            rx.text(item["name"], font_weight="600", color=TEXT_PRIMARY, font_size="14px", no_of_lines=1),
            rx.text(item["category"], font_size="12px", color=TEXT_SECONDARY),
            rx.text("₹", item["final_price"], font_weight="700", color=PRIMARY, font_size="16px"),
            align_items="start",
            spacing="1",
            flex="1",
        ),
        rx.spacer(),
        rx.hstack(
            rx.button(
                "-",
                on_click=AppState.update_quantity(item["id"], -1),
                size="1",
                variant="soft",
                color_scheme="violet",
            ),
            rx.text(item["quantity"], font_weight="700", color=TEXT_PRIMARY, min_width="24px", text_align="center"),
            rx.button(
                "+",
                on_click=AppState.update_quantity(item["id"], 1),
                size="1",
                variant="soft",
                color_scheme="violet",
            ),
            spacing="2",
            align="center",
        ),
        rx.button(
            rx.icon("trash-2", size=16),
            on_click=AppState.remove_from_cart(item["id"]),
            variant="ghost",
            color_scheme="red",
            size="1",
        ),
        width="100%",
        padding="14px",
        background="rgba(255,255,255,0.02)",
        border_radius="14px",
        border=f"1px solid {BORDER_COLOR}",
        align="center",
        spacing="3",
        flex_wrap="wrap",
    )


def order_summary() -> rx.Component:
    return rx.vstack(
        rx.text("Order Summary", font_size="18px", font_weight="700", color=TEXT_PRIMARY),
        rx.divider(color=BORDER_COLOR),
        rx.hstack(
            rx.text("Subtotal", color=TEXT_SECONDARY),
            rx.spacer(),
            rx.text("₹", AppState.cart_total, color=TEXT_PRIMARY, font_weight="500"),
            width="100%",
        ),
        rx.hstack(
            rx.text("Discount", color=TEXT_SECONDARY),
            rx.spacer(),
            rx.text("- ₹", AppState.discount_amount, color=SUCCESS, font_weight="500"),
            width="100%",
        ),
        rx.hstack(
            rx.text("Delivery", color=TEXT_SECONDARY),
            rx.spacer(),
            rx.text("FREE", color=SUCCESS, font_weight="600"),
            width="100%",
        ),
        rx.hstack(
            rx.text("GST (18%)", color=TEXT_SECONDARY),
            rx.spacer(),
            rx.text("₹", AppState.gst_amount, color=TEXT_PRIMARY, font_weight="500"),
            width="100%",
        ),
        rx.divider(color=BORDER_COLOR),
        rx.hstack(
            rx.text("Grand Total", font_weight="700", font_size="16px", color=TEXT_PRIMARY),
            rx.spacer(),
            rx.text("₹", AppState.grand_total, font_weight="800", font_size="20px", color=PRIMARY),
            width="100%",
        ),
        # Coupon
        rx.vstack(
            rx.text("Have a coupon?", font_size="13px", color=TEXT_SECONDARY),
            rx.hstack(
                rx.input(
                    placeholder="e.g. SAVE10 or FIRST50",
                    value=AppState.coupon_code,
                    on_change=AppState.set_coupon_code,
                    background=BG_SURFACE,
                    border=f"1px solid {BORDER_COLOR}",
                    color=TEXT_PRIMARY,
                    border_radius="10px",
                    size="2",
                    flex="1",
                    _placeholder={"color": TEXT_SECONDARY},
                ),
                rx.button(
                    "Apply",
                    on_click=AppState.apply_coupon,
                    background=PRIMARY,
                    color="white",
                    border_radius="10px",
                    size="2",
                ),
                width="100%",
                spacing="2",
            ),
            align_items="start",
            width="100%",
            spacing="2",
        ),
        # Checkout CTA
        rx.button(
            "Proceed to Checkout →",
            on_click=rx.redirect("/checkout"),
            disabled=AppState.cart_count == 0,
            background=GRADIENT_PRIMARY,
            color="white",
            width="100%",
            size="3",
            border_radius="12px",
            font_weight="600",
            _hover={"opacity": "0.88"},
        ),
        width=rx.breakpoints(initial="100%", md="340px"),
        padding="24px",
        background=BG_CARD,
        border_radius="16px",
        border=f"1px solid {BORDER_COLOR}",
        align_items="start",
        spacing="4",
        height="fit-content",
    )


def cart() -> rx.Component:
    return rx.box(
        navbar(),
        rx.container(
            rx.vstack(
                rx.text("Your Cart", font_size="28px", font_weight="800", color=TEXT_PRIMARY, padding_top="8"),
                rx.cond(
                    AppState.cart_count == 0,
                    # Empty state
                    rx.center(
                        rx.vstack(
                            rx.icon("shopping-cart", size=80, color=TEXT_SECONDARY),
                            rx.text("Your cart is empty", font_size="20px", color=TEXT_SECONDARY),
                            rx.text("Discover products with AI-powered recommendations",
                                    font_size="14px", color=TEXT_SECONDARY),
                            rx.link(
                                rx.button("Browse Products", background=GRADIENT_PRIMARY, color="white",
                                          border_radius="12px", size="3"),
                                href="/products",
                            ),
                            spacing="4",
                            align="center",
                        ),
                        padding_y="80px",
                        width="100%",
                    ),
                    # Cart with items
                    rx.flex(
                        # Items list
                        rx.vstack(
                            rx.foreach(AppState.cart_items, cart_item),
                            width="100%",
                            spacing="3",
                            flex="1",
                        ),
                        # Summary panel
                        order_summary(),
                        direction=rx.breakpoints(initial="column", md="row"),
                        gap="6",
                        align="start",
                        width="100%",
                    ),
                ),
                max_width="1200px",
                width="100%",
                padding_y="8",
                spacing="6",
            ),
        ),
        footer(),
        background=BG_DARK,
        min_height="100vh",
    )
