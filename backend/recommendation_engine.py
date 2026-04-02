"""
recommendation_engine.py
4 recommendation strategies on cleaned_data.csv:
  1. Rating-Based    — Bayesian weighted average
  2. Content-Based   — TF-IDF on Tags + cosine similarity
  3. Collaborative   — User-user cosine similarity on Rating pivot
  4. Hybrid          — Weighted combination of all three signals
"""
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from data_loader import format_product


class RecommendationEngine:

    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self._build_content_model()
        self._build_collab_model()

    # ── Model builders ─────────────────────────────────────────────────────────
    def _build_content_model(self):
        tags = self.df["Tags"].fillna("").astype(str)
        self.tfidf = TfidfVectorizer(
            stop_words="english",
            max_features=3000,
            ngram_range=(1, 2)
        )
        self.tfidf_matrix = self.tfidf.fit_transform(tags)

    def _build_collab_model(self):
        """Build user-item rating matrix from rows where Rating > 0."""
        rated = self.df[self.df["Rating"] > 0].copy()
        if rated.empty:
            self.user_item = pd.DataFrame()
            self.user_sim  = pd.DataFrame()
            return
        self.user_item = rated.pivot_table(
            index="User's ID", columns="ProdID",
            values="Rating", fill_value=0
        )
        sim = cosine_similarity(self.user_item)
        self.user_sim = pd.DataFrame(
            sim,
            index=self.user_item.index,
            columns=self.user_item.index,
        )

    # ── 1. Rating-Based ────────────────────────────────────────────────────────
    def get_top_rated(self, top_n: int = 24) -> list[dict]:
        """Bayesian weighted rating: score = (v/(v+m))*R + (m/(v+m))*C"""
        unique = self.df.drop_duplicates("ProdID").copy()
        rated  = unique[unique["Rating"] > 0]
        if rated.empty:
            return self._fmt(unique.head(top_n))

        C = rated["Rating"].mean()
        m = rated["Review Count"].quantile(0.70)
        v = unique["Review Count"].fillna(0)
        R = unique["Rating"].fillna(0)
        unique["_score"] = (v / (v + m)) * R + (m / (v + m)) * C
        top = unique.nlargest(top_n, "_score")
        return self._fmt(top)

    # ── 2. Content-Based ───────────────────────────────────────────────────────
    def get_content_based(self, prod_id: int, top_n: int = 12) -> list[dict]:
        """Cosine similarity on TF-IDF Tags vectors."""
        idx_list = self.df.index[self.df["ProdID"] == prod_id].tolist()
        if not idx_list:
            return self.get_top_rated(top_n)
        idx    = idx_list[0]
        scores = cosine_similarity(self.tfidf_matrix[idx], self.tfidf_matrix).flatten()
        top_idx = scores.argsort()[::-1][1: top_n + 1]
        results = []
        for i in top_idx:
            p = format_product(self.df.iloc[i])
            p["match_score"] = f"{round(float(scores[i]) * 100)}% Match"
            results.append(p)
        return results

    # ── 3. Collaborative ───────────────────────────────────────────────────────
    def get_collaborative(self, user_id: int, top_n: int = 12) -> list[dict]:
        """User-user collaborative filtering. Falls back to top-rated."""
        if self.user_item.empty or user_id not in self.user_sim.index:
            return self.get_top_rated(top_n)

        similar = self.user_sim[user_id].sort_values(ascending=False)[1:11]
        sim_ratings = self.user_item.loc[similar.index]

        user_row      = self.user_item.loc[user_id]
        not_rated_ids = user_row[user_row == 0].index

        if not_rated_ids.empty or sim_ratings.empty:
            return self.get_top_rated(top_n)

        # Weighted average using similarity scores
        weights = similar.values.reshape(-1, 1)

        weighted_scores = (sim_ratings * weights).sum(axis=0) / weights.sum()

        avg_scores = weighted_scores[not_rated_ids].sort_values(ascending=False)
        top_ids = avg_scores.head(top_n).index.tolist()

        results = []
        for pid in top_ids:
            row = self.df[self.df["ProdID"] == pid]
            if not row.empty:
                p = format_product(row.iloc[0])
                p["match_score"] = f"{round(float(avg_scores[pid]) * 20)}% Match"
                results.append(p)
        return results or self.get_top_rated(top_n)

    # ── 4. Hybrid ──────────────────────────────────────────────────────────────
    def get_hybrid(self, user_id: int, prod_id: int, top_n: int = 12) -> list[dict]:
        """0.4×content + 0.4×collaborative + 0.2×popularity"""
        content_list = self.get_content_based(prod_id, top_n=top_n * 2)
        collab_list  = self.get_collaborative(user_id,  top_n=top_n * 2)

        content_ids = {p["id"]: i for i, p in enumerate(content_list)}
        collab_ids  = {p["id"]: i for i, p in enumerate(collab_list)}
        all_ids     = list(set(content_ids) | set(collab_ids))

        n_c   = max(len(content_ids), 1)
        n_col = max(len(collab_ids), 1)
        max_rev = float(self.df["Review Count"].max() or 1)

        scores = {}
        for pid in all_ids:
            c   = 1 - content_ids.get(pid, n_c)  / n_c
            co  = 1 - collab_ids.get(pid, n_col) / n_col
            row = self.df[self.df["ProdID"].astype(str) == pid]
            pop = float(row["Review Count"].values[0]) / max_rev if not row.empty else 0
            # Dynamic weighting
            if user_id not in self.user_sim.index:
                w_c, w_co, w_p = 0.6, 0.0, 0.4   # new user
            else:
                w_c, w_co, w_p = 0.3, 0.5, 0.2   # existing user

            scores[pid] = round(w_c * c + w_co * co + w_p * pop, 4)

        top_ids = sorted(scores, key=scores.get, reverse=True)[:top_n]
        results = []
        for pid in top_ids:
            row = self.df[self.df["ProdID"].astype(str) == pid]
            if not row.empty:
                p = format_product(row.iloc[0])
                p["match_score"] = f"{round(scores[pid] * 100)}% Match"
                results.append(p)
        return results

    def _fmt(self, subset) -> list[dict]:
        return [format_product(row) for _, row in subset.iterrows()]
