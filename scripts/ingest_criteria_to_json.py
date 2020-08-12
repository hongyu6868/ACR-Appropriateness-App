# -*- coding: utf-8 -*-
import csv
import json

_INPUT_CSV = './data/criteria.csv'
_OUTPUT_JSON = './data/criteria.json'

def main():
    output_data = dict()
    with open(_INPUT_CSV) as csvfile:
        csvreader = csv.reader(csvfile)
        header = ""
        acc = []
        for row in csvreader:
            if row[0] and "appropriate" not in row[1].lower():
                # Header detected
                if header:
                    output_data[header] = acc
                header = row[0]
                acc = []
            elif "appropriate" in row[1].lower():
                # Criteria detected
                acc.append(row)
    with open(_OUTPUT_JSON, "w") as outfile:
        outfile.write(json.dumps(output_data, indent=4))

if __name__ == '__main__':
    main()
    
