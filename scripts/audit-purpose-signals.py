"""Diagnostic only: simulate the brief's mappings; does not implement app scoring."""
import json
import random
from collections import Counter

SIGNALS = ["Belonging", "Teaching", "Access", "Creative expression", "Justice",
           "Stability", "Healing", "Problem solving", "Independence"]
QUESTIONS = {
    1: [("Belonging", "Healing"), ("Teaching",), ("Access",),
        ("Creative expression",), ("Problem solving",), ("Independence",)],
    2: [("Justice",), ("Independence",), ("Stability",), ("Belonging",),
        ("Teaching",), ("Creative expression",), ("Healing",)],
    3: [("Healing",), ("Access", "Justice"), ("Teaching",),
        ("Belonging", "Stability"), ("Problem solving",),
        ("Creative expression",), ("Independence",)],
    5: [("Healing", "Belonging"), ("Justice",), ("Creative expression",),
        ("Teaching",), ("Stability",), ("Access", "Independence"),
        ("Problem solving",)],
    6: [("Belonging",), ("Access",), ("Healing",), ("Teaching",), ("Justice",),
        ("Creative expression",), ("Stability",), ("Independence",),
        ("Problem solving",)],
}


def simulate(randomize_unresolved_ties):
    rng = random.Random(20261004)
    tie_rng = random.Random(20261005)
    counts = Counter({signal: 0 for signal in SIGNALS})
    unresolved = 0
    for _ in range(10000):
        contributions = {}
        totals = Counter({signal: 0 for signal in SIGNALS})
        for question, options in QUESTIONS.items():
            count = 1 if question == 6 else rng.choice([1, 2])
            points = Counter(signal for option in rng.sample(options, count) for signal in option)
            contributions[question] = points
            totals.update(points)
        def key(signal):
            return (totals[signal], *(contributions[q][signal] for q in [3, 5, 6, 2, 1]))
        order = SIGNALS.copy()
        if randomize_unresolved_ties:
            tie_rng.shuffle(order)
        order.sort(key=key, reverse=True)
        if key(order[1]) == key(order[2]):
            unresolved += 1
        counts.update(order[:2])
    average = 20000 / len(SIGNALS)
    return {
        "unresolvedSecondThirdTies": unresolved,
        "topTwo": {signal: {"count": counts[signal], "percent": round(counts[signal] / 100, 2),
                            "multipleOfAverage": round(counts[signal] / average, 3),
                            "above1_5TimesAverage": counts[signal] > 1.5 * average}
                   for signal in SIGNALS},
    }


if __name__ == "__main__":
    result = {
        "seed": 20261004, "samplesPerPolicy": 10000,
        "selectionModel": "Uniform 1 or 2 distinct choices for Q1/Q2/Q3/Q5; uniform single choice for Q6. Q4 omitted because it adds no signals.",
        "tieModel": "Total points, then per-question points Q3,Q5,Q6,Q2,Q1. Residual ties are unspecified by the brief; report two diagnostic policies, neither adopted as product behavior.",
        "questionFrequency": {signal: sum(any(signal in option for option in options)
                                         for options in QUESTIONS.values()) for signal in SIGNALS},
        "stableBriefOrderResidualTies": simulate(False),
        "seededRandomResidualTies": simulate(True),
    }
    print(json.dumps(result, indent=2))
