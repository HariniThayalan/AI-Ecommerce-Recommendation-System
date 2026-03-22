import reflex as rx
from shop_smart.style import (
    PRIMARY, SECONDARY, SUCCESS, TEXT_PRIMARY, TEXT_SECONDARY,
    BORDER_COLOR, BG_SURFACE, CARD_STYLE, GRADIENT_PRIMARY,
)
from shop_smart.state.app_state import AppState


def product_card(product: dict) -> rx.Component:
    """Reusable product card — Reflex-safe, no Python ops on reactive vars."""
    return rx.box(
        # ── Image + overlay buttons ──────────────────────────────────────────
        rx.box(
            rx.image(
                src=product["image_url"],
                width="100%",
                height="200px",
                object_fit="cover",
                border_radius="12px 12px 0 0",
            ),
            # Wishlist heart
            rx.box(
                rx.icon(
                    "heart",
                    color=rx.cond(
                        AppState.wishlist_ids.contains(product["id"]),
                        SECONDARY,
                        TEXT_SECONDARY,
                    ),
                    cursor="pointer",
                    on_click=AppState.toggle_wishlist(product["id"]),
                    size=20,
                ),
                position="absolute",
                top="10px",
                right="10px",
                background="rgba(15,14,23,0.7)",
                border_radius="50%",
                padding="6px",
                backdrop_filter="blur(8px)",
            ),
            # AI badge
            rx.cond(
                AppState.recommendation_mode != "top_rated",
                rx.box(
                    rx.text("AI Pick", color=TEXT_PRIMARY, font_size="11px", font_weight="700"),
                    position="absolute",
                    top="10px",
                    left="10px",
                    background=GRADIENT_PRIMARY,
                    border_radius="20px",
                    padding="2px 10px",
                ),
            ),
            position="relative",
        ),
        # ── Info section ─────────────────────────────────────────────────────
        rx.vstack(
            # Brand + category
            rx.hstack(
                rx.badge(product["brand"], color_scheme="violet", variant="soft", size="1"),
                rx.badge(product["category"], color_scheme="gray", variant="soft", size="1"),
                spacing="2",
                flex_wrap="wrap",
            ),
            # Name
            rx.text(
                product["name"],
                font_weight="600",
                color=TEXT_PRIMARY,
                font_size="14px",
                no_of_lines=2,
            ),
            # Stars + review count
            rx.hstack(
                rx.icon("star", color="#FFB800", size=14),
                rx.text(product["avg_rating"], color="#FFB800", font_size="13px", font_weight="600"),
                rx.text("(", product["rating_count"], ")", color=TEXT_SECONDARY, font_size="12px"),
                spacing="1",
                align="center",
            ),
            # Price row
            rx.hstack(
                rx.text(
                    product["final_price_str"],
                    font_weight="700",
                    font_size="18px",
                    color=PRIMARY,
                ),
                rx.cond(
                    product["discount_percent"].to(int) > 0,
                    rx.hstack(
                        rx.text(
                            product["price_str"],
                            text_decoration="line-through",
                            color=TEXT_SECONDARY,
                            font_size="13px",
                        ),
                        rx.badge(
                            product["discount_percent"], "% off",
                            color_scheme="green",
                            variant="soft",
                            size="1",
                        ),
                        spacing="2",
                        align="center",
                    ),
                ),
                spacing="3",
                align="center",
                flex_wrap="wrap",
            ),
            # Add to cart
            rx.button(
                rx.icon("shopping-cart", size=16),
                "Add to Cart",
                on_click=AppState.add_to_cart(product),
                width="100%",
                background=GRADIENT_PRIMARY,
                color="white",
                border_radius="10px",
                _hover={"opacity": "0.88"},
                size="2",
            ),
            padding="16px",
            spacing="3",
            width="100%",
            align_items="start",
        ),
        style=CARD_STYLE,
        position="relative",
        overflow="hidden",
        width="100%",
    )
