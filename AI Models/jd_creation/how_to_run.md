# JD Generation Tool

## Overview
This tool generates job descriptions using AI models and exports them as formatted PDF files.

## Prerequisites
- Python 3.8 or higher
- GTK3 Runtime (required for PDF generation on Windows)

## Installation

### 1. Install Python Dependencies
Run the following command to install required libraries:
pip install -r requirements.txt

### 2. Install GTK3 Runtime (Windows Only)
The PDF rendering engine (WeasyPrint) requires GTK3. You can install it using winget:
winget install tschoonj.GTKForWindows

### 3. Configure Environment Variables
Create a .env file in this directory and add your OpenRouter API key:
OPENROUTER_API_KEY=your_api_key

## How to Run
Launch the interactive CLI tool by running:
python jd_generator_cli.py

Follow the on-screen prompts to input job details and generate the PDF.


