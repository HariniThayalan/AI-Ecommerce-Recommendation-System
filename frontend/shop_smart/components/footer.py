import reflex as rx
from shop_smart.style import (
    PRIMARY, TEXT_PRIMARY, TEXT_SECONDARY,
    BORDER_COLOR, BG_DARK, BG_SURFACE,
)


def footer() -> rx.Component:
    """Footer with 4 columns and social icons."""
    return rx.vstack(
        rx.container(
            rx.grid(
                # ── Brand column ───────────────────────────────────────────
                rx.vstack(
                    rx.hstack(
                        rx.icon("shopping-bag", color=PRIMARY, size=20),
                        rx.text("ShopSmart", font_weight="800", font_size="18px", color=TEXT_PRIMARY),
                        rx.text("AI", color=PRIMARY, font_weight="800", font_size="18px"),
                        spacing="1",
                    ),
                    rx.text(
                        "Bringing the power of artificial intelligence to your everyday shopping experience.",
                        color=TEXT_SECONDARY,
                        font_size="13px",
                        line_height="1.8",
                    ),
                    # Social icons — only use Lucide icons that actually exist
                    rx.hstack(
                        rx.link(
                            rx.icon("github", color=TEXT_SECONDARY, size=20,
                                    _hover={"color": PRIMARY}),
                            href="https://github.com",
                            is_external=True,
                        ),
                        rx.link(
                            rx.icon("link-2", color=TEXT_SECONDARY, size=20,
                                    _hover={"color": PRIMARY}),
                            href="https://linkedin.com",
                            is_external=True,
                        ),
                        rx.link(
                            rx.icon("mail", color=TEXT_SECONDARY, size=20,
                                    _hover={"color": PRIMARY}),
                            href="mailto:contact@shopsmart.ai",
                        ),
                        rx.link(
                            rx.icon("globe", color=TEXT_SECONDARY, size=20,
                                    _hover={"color": PRIMARY}),
                            href="#",
                        ),
                        spacing="4",
                        padding_top="3",
                    ),
                    align_items="start",
                    spacing="3",
                ),
                # ── Quick links ────────────────────────────────────────────
                rx.vstack(
                    rx.text("Quick Links", font_weight="700", color=TEXT_PRIMARY, font_size="14px"),
                    rx.link("Home",     href="/",        color=TEXT_SECONDARY, font_size="14px",
                            _hover={"color": PRIMARY}),
                    rx.link("Products", href="/products", color=TEXT_SECONDARY, font_size="14px",
                            _hover={"color": PRIMARY}),
                    rx.link("Cart",     href="/cart",     color=TEXT_SECONDARY, font_size="14px",
                            _hover={"color": PRIMARY}),
                    rx.link("Profile",  href="/profile",  color=TEXT_SECONDARY, font_size="14px",
                            _hover={"color": PRIMARY}),
                    # ✅ No /about link — route doesn't exist
                    spacing="2",
                    align_items="start",
                ),
                # ── Categories ─────────────────────────────────────────────
                rx.vstack(
                    rx.text("Categories", font_weight="700", color=TEXT_PRIMARY, font_size="14px"),
                    rx.link("Electronics",   href="/products", color=TEXT_SECONDARY, font_size="14px",
                            _hover={"color": PRIMARY}),
                    rx.link("Fashion",       href="/products", color=TEXT_SECONDARY, font_size="14px",
                            _hover={"color": PRIMARY}),
                    rx.link("Home & Kitchen",href="/products", color=TEXT_SECONDARY, font_size="14px",
                            _hover={"color": PRIMARY}),
                    rx.link("Sports",        href="/products", color=TEXT_SECONDARY, font_size="14px",
                            _hover={"color": PRIMARY}),
                    spacing="2",
                    align_items="start",
                ),
                # ── Newsletter ─────────────────────────────────────────────
                rx.vstack(
                    rx.text("Newsletter", font_weight="700", color=TEXT_PRIMARY, font_size="14px"),
                    rx.text(
                        "Get the latest AI-driven deals and new arrivals.",
                        color=TEXT_SECONDARY, font_size="13px",
                    ),
                    rx.hstack(
                        rx.input(
                            placeholder="your@email.com",
                            background=BG_SURFACE,
                            border=f"1px solid {BORDER_COLOR}",
                            color=TEXT_PRIMARY,
                            border_radius="8px",
                            size="2",
                            flex="1",
                            _placeholder={"color": TEXT_SECONDARY},
                        ),
                        rx.button(
                            "Join",
                            background=PRIMARY,
                            color="white",
                            border_radius="8px",
                            size="2",
                            _hover={"opacity": "0.88"},
                        ),
                        width="100%",
                        spacing="2",
                    ),
                    align_items="start",
                    spacing="3",
                    width="100%",
                ),
                columns=rx.breakpoints(initial="1", sm="2", md="4"),
                spacing="8",
                width="100%",
            ),
            max_width="1200px",
            width="100%",
            padding_top="16",
            padding_bottom="8",
        ),
        # ── Copyright bar ──────────────────────────────────────────────────
        rx.center(
            rx.text(
                "© 2026 ShopSmart AI · Built with Reflex & FastAPI · Powered by ML",
                color=TEXT_SECONDARY,
                font_size="12px",
                text_align="center",
            ),
            border_top=f"1px solid {BORDER_COLOR}",
            width="100%",
            padding_y="5",
        ),
        width="100%",
        background=BG_DARK,
        border_top=f"1px solid {BORDER_COLOR}",
    )
