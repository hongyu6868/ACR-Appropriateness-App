import json

def main():
    new_json = dict()
    with open("criteria.json") as f:
        data = json.load(f)
        for system in data["systems"]:
            system_name = system["name"]
            new_json[system_name] = dict()
            for complaint in system["complaints"]:
                complaint_name = complaint["name"]
                new_json[system_name][complaint_name] = dict()
                for variant in complaint["variants"]:
                    variant_name = variant["name"]
                    new_json[system_name][complaint_name][variant_name] = variant["recommendation_table"]
    with open("new_criteria.json", "w") as outfile:
        outfile.write(json.dumps(new_json, indent=4))

if __name__ == '__main__':
    main()
