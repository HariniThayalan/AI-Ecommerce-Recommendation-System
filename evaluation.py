def precision_at_k(recommended_items, relevant_items, k=5):

    if k == 0:
        return 0.0

    recommended_k = recommended_items[:k]

    recommended_set = set(recommended_k)
    relevant_set = set(relevant_items)

    true_positives = len(recommended_set & relevant_set)

    precision = true_positives / k

    return precision


def recall_at_k(recommended_items, relevant_items, k=5):

    recommended_k = recommended_items[:k]

    recommended_set = set(recommended_k)
    relevant_set = set(relevant_items)

    if len(relevant_set) == 0:
        return 0.0

    true_positives = len(recommended_set & relevant_set)

    recall = true_positives / len(relevant_set)

    return recall