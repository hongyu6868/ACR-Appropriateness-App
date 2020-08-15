# -*- coding: utf-8 -*-
import csv
import json
import sys

# EXAMPLE USAGE: python ingest_cornell_criteria_to_json.py data/cornell_criteria_headache.csv data/cornell_criteria_headache.json

_INPUT_CSV = sys.argv[1]
_OUTPUT_JSON = sys.argv[2]

_RECOMMENDATIONS = ["Not applicable", "Inappropriate", "Contact Radiology", "Appropriate", "Appropriate Preferred"]

def has_digit(arr):
    for s in arr:
        if s.isdigit():
            return True
    return False

def main():
    output_data = dict()
    
    # Split the data up by table.
    blocks = []
    with open(_INPUT_CSV) as csvfile:
        csvreader = csv.reader(csvfile)
        acc = []
        has_encountered_digit = False
        for row in csvreader:
            if has_encountered_digit and not has_digit(row):
                blocks.append(acc)
                acc = [row]
                has_encountered_digit = False
            else:
                acc.append(row)
            if has_digit(row):
                has_encountered_digit = True

    # Parse each block
    for block in blocks:
        complaint = block[0][0]
        studies = block[1]
        evidence = block[2:]
        output_data[complaint] = dict()
        for row in evidence:
            recommendation = zip(studies, row)
            condition = recommendation[0][1]

            # Parse prior in either column 1 or 2
            prior = ""
            if "Prior" in recommendation[1][0]:
                prior = recommendation[1][1]
            elif "Prior" in recommendation[2][0]:
                prior = recommendation[2][1]

            # Parse contraindication in either column 1 or 2
            contraindication = ""
            if "Contraindication" in recommendation[1][0]:
                contraindication = recommendation[1][1]
            if "Contraindication" in recommendation[2][0]:
                contraindication = recommendation[2][1]

            # Filter recommendation for studies only
            filtered_recommendation = filter(
                lambda s: "Prior" not in s[0] and "Contraindication" not in s[0] and "Condition" not in s[0] and "Reference" not in s[0],
                recommendation)

            # Build variant from condition + prior + contraindication
            variant = condition
            if prior:
                variant += " | Prior: " + prior + "."
            if contraindication:
                variant += " | Contraindication: " + contraindication + "."

            # Build recommendation table
            recommendation_table = []
            for study, evidence in sorted(filtered_recommendation, key=lambda s: s[1], reverse=True):
                if study and evidence.isdigit() and int(evidence) < 5:
                    recommendation_table.append({
                        "studyName": study,
                        "recommendation": _RECOMMENDATIONS[int(evidence)]
                    })

            output_data[complaint][variant] = recommendation_table

    with open(_OUTPUT_JSON, "w") as outfile:
        outfile.write(json.dumps(output_data, indent=4))

if __name__ == '__main__':
    main()
