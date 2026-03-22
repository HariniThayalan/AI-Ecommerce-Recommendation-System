import reflex as rx
from shop_smart.style import (
    PRIMARY, SECONDARY, TEXT_PRIMARY, TEXT_SECONDARY,
    BORDER_COLOR, BG_SURFACE, BG_CARD, NAVBAR_STYLE, GRADIENT_PRIMARY,
)
from shop_smart.state.app_state import AppState


def navbar() -> rx.Component:
    """Sticky glassmorphism navbar."""
    return rx.box(
        rx.hstack(
            # ── Logo ────────────────────────────────────────────────────────
            rx.hstack(
                rx.icon("shopping-bag", color=PRIMARY, size=24),
                rx.text("ShopSmart", font_weight="800", font_size="20px", color=TEXT_PRIMARY),
                rx.text("AI", color=SECONDARY, font_weight="800", font_size="20px"),
                spacing="1",
                cursor="pointer",
                on_click=rx.redirect("/"),
                align="center",
            ),
            rx.spacer(),
            # ── Search (hidden on mobile) ────────────────────────────────────
            rx.box(
                rx.input(
                    placeholder="Search products, brands...",
                    flex="1",
                    max_width="420px",
                    background=f"rgba(22,33,62,0.8)",
                    border=f"1px solid rgba(108,99,255,0.3)",
                    color=TEXT_PRIMARY,
                    border_radius="24px",
                    padding="10px 20px",
                    _placeholder={"color": TEXT_SECONDARY},
                    _focus={"border_color": PRIMARY, "outline": "none"},
                    on_change=AppState.set_search_query,
                ),
                display=rx.breakpoints(initial="none", md="flex"),
                flex="1",
                justify_content="center",
            ),
            rx.spacer(),
            # ── Right icons ──────────────────────────────────────────────────
            rx.hstack(
                # Wishlist
                rx.link(
                    rx.box(
                        rx.icon("heart", color=TEXT_SECONDARY, size=22,
                                _hover={"color": SECONDARY}),
                        position="relative",
                        cursor="pointer",
                    ),
                    href="/profile",
                ),
                # Cart with badge
                rx.link(
                    rx.box(
                        rx.icon("shopping-cart", color=TEXT_SECONDARY, size=22,
                                _hover={"color": PRIMARY}),
                        rx.cond(
                            AppState.cart_count > 0,
                            rx.badge(
                                AppState.cart_count,
                                color_scheme="violet",
                                variant="solid",
                                position="absolute",
                                top="-8px",
                                right="-8px",
                                border_radius="full",
                                size="1",
                            ),
                        ),
                        position="relative",
                        cursor="pointer",
                    ),
                    href="/cart",
                ),
                # Auth avatar / login button
                rx.cond(
                    AppState.is_logged_in,
                    rx.link(
                        rx.box(
                            rx.text(
                                AppState.user_initial,
                                color=TEXT_PRIMARY,
                                font_weight="700",
                                font_size="14px",
                            ),
                            background=GRADIENT_PRIMARY,
                            border_radius="50%",
                            width="36px",
                            height="36px",
                            display="flex",
                            align_items="center",
                            justify_content="center",
                            cursor="pointer",
                        ),
                        href="/profile",
                    ),
                    rx.link(
                        rx.button(
                            "Sign In",
                            background=GRADIENT_PRIMARY,
                            color="white",
                            border_radius="10px",
                            size="2",
                            _hover={"opacity": "0.88"},
                        ),
                        href="/profile",
                    ),
                ),
                spacing="5",
                align="center",
            ),
            width="100%",
            align="center",
            height="64px",
        ),
        style=NAVBAR_STYLE,
    )
