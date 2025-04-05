import os
import subprocess
import tempfile
from pathlib import Path

def is_text_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            f.read()
        return True
    except:
        return False

def extract_repository_contents(repo_url, output_filename="repository_contents.txt"):
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"[INFO] Cloning repository into temporary directory...")
        result = subprocess.run(["git", "clone", repo_url, temp_dir], capture_output=True, text=True)

        if result.returncode != 0:
            print("[ERROR] Failed to clone repository:")
            print(result.stderr)
            return

        print("[INFO] Repository cloned successfully.")

        output_path = Path(output_filename)
        with output_path.open("w", encoding="utf-8") as outfile:
            for root, dirs, files in os.walk(temp_dir):
                # スキップするディレクトリ
                if ".git" in dirs:
                    dirs.remove(".git")
                for file in files:
                    file_path = Path(root) / file
                    rel_path = file_path.relative_to(temp_dir)
                    if is_text_file(file_path):
                        outfile.write(f"\n\n--- FILE: {rel_path} ---\n")
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                outfile.write(f.read())
                        except Exception as e:
                            print(f"[WARNING] Skipping file {rel_path}: {e}")
                    else:
                        print(f"[INFO] Skipping non-text file: {rel_path}")

        print(f"[SUCCESS] All contents written to '{output_filename}'")

if __name__ == "__main__":
    repo_url = input("GitリポジトリのURLを入力してください: ").strip()
    extract_repository_contents(repo_url)
