import os

def load_initial_bpmn_xml(file_path: str="base_template.xml") -> str:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    xml_path = os.path.join(BASE_DIR, f"../templates/{file_path}")
    with open(xml_path, "r", encoding="utf-8") as f:
        return f.read() 