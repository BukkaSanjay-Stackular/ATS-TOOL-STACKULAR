from fpdf import FPDF

pdf = FPDF()
pdf.add_page()

pdf.set_font("Arial", size=16)
pdf.cell(200, 10, txt="Hello Sekhar", ln=True)

pdf.output("output.pdf")