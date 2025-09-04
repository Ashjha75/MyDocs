import os

def dump_project_files(root_folder, output_file, skip_extensions=None, skip_files=None, skip_folders=None):
    """
    Recursively reads all files in a project folder (Angular, Astro, Spring Boot, etc.),
    skipping certain files/extensions/folders, and writes their contents into a single output file.
    """

    if skip_extensions is None:
        skip_extensions = []
    if skip_files is None:
        skip_files = []
    if skip_folders is None:
        skip_folders = []

    with open(output_file, "w", encoding="utf-8") as outfile:
        for foldername, subfolders, filenames in os.walk(root_folder):

            # Skip unwanted folders completely
            if any(skip in foldername for skip in skip_folders):
                continue

            for filename in filenames:
                file_ext = os.path.splitext(filename)[1].lower()

                # Skip unwanted extensions or filenames
                if file_ext in skip_extensions or filename.lower() in skip_files:
                    continue

                file_path = os.path.join(foldername, filename)
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as infile:
                        outfile.write(f"\n\n=== FILE: {file_path} ===\n\n")
                        outfile.write(infile.read())
                except Exception as e:
                    outfile.write(
                        f"\n\n=== FILE: {file_path} (Could not read: {e}) ===\n\n"
                    )


if __name__ == "__main__":
    # 👇 Change this to your project folder (Angular / Astro / Spring Boot / etc.)
    root_folder = r"C:\Users\Ashish jha\Desktop\PERSONAL\DOCS\astroDocs\vigorous-visual"

    # Output file for AI reference
    output_file = "combined_project.txt"

    # Extensions to skip (binaries, media, build artifacts, etc.)
    skip_extensions = [
        ".jpg", ".jpeg", ".png", ".ico", ".bmp", ".mp3", ".svg", ".avi", ".mov",
        ".zip", ".rar", ".7z", ".tar", ".gz", ".class", ".jar", ".exe", ".dll",
        ".pdf", ".db", ".lock", ".ttf", ".woff", ".woff2", ".eot"
    ]

    # Specific files to skip (system or metadata files)
    skip_files = [
        ".ds_store", "thumbs.db", "package-lock.json", "yarn.lock"
    ]

    # Entire folders to skip
    skip_folders = [
        "node_modules", "dist", "build", ".git", ".angular", ".astro", ".vscode",
        "coverage", ".idea", ".next", "out"
    ]

    dump_project_files(root_folder, output_file, skip_extensions, skip_files, skip_folders)
    print(f"✅ All project files dumped into: {output_file}")
