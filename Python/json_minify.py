import json
import sys

def minify_json(input_file, output_file):
    try:
        # JSONファイルを読み込む
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # JSONを1行に変換して書き出す
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        
        print(f"Successfully minified JSON from {input_file} to {output_file}")
        
    except FileNotFoundError:
        print(f"Error: Input file '{input_file}' not found")
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in {input_file}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python json_minify.py input.json output.json")
    else:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
        minify_json(input_file, output_file)

