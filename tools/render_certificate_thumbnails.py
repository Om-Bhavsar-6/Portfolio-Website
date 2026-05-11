import os
import re
import fitz


def slugify(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9]+", "-", name).strip("-").lower()


def main() -> None:
    project = r"C:\Users\omkbh.OM.000\personal-website-main"
    pdf_dir = os.path.join(project, "assets", "certificates")
    out_dir = os.path.join(project, "assets", "certificate-images")
    os.makedirs(out_dir, exist_ok=True)

    for filename in sorted(os.listdir(pdf_dir)):
        if not filename.lower().endswith(".pdf"):
            continue
        source = os.path.join(pdf_dir, filename)
        output_name = slugify(os.path.splitext(filename)[0]) + ".jpg"
        output = os.path.join(out_dir, output_name)

        try:
            with fitz.open(source) as doc:
                page = doc.load_page(0)
                pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
                pix.save(output)
            print(f"OK|{filename}|{output_name}")
        except Exception as exc:
            print(f"ERR|{filename}|{exc}")


if __name__ == "__main__":
    main()
