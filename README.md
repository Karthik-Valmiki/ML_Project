# Pyanm: Network Flow & Bot Intrusion Detection Platform

A modular machine learning system and REST API designed to detect automated malicious bots, volumetric attacks, and network intrusions using the **UNSW-NB15** benchmark dataset.

---

## Dataset

Download datasets from the link: [https://www.kaggle.com/datasets/mrwellsdavid/unsw-nb15](https://www.kaggle.com/datasets/mrwellsdavid/unsw-nb15)

---

## Quickstart

### 1. Installation
Ensure Python 3.10+ is installed, then install dependencies:
```bash
pip install -r requirements.txt
```

### 2. Run the Application
Launch the server using:
```bash
python run.py
```

### 3. Endpoints
* **Web Dashboard:** [http://127.0.0.1:8000/dashboard](http://127.0.0.1:8000/dashboard)
* **Interactive API Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Reference:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## Machine Learning Lifecycle (Reviews I – III)

1. **Review I — Data Engineering & Preprocessing (`EDA.ipynb`):**
   * Curated 257,673 network flows from UNSW-NB15.
   * `log1p` transformation applied to heavy-tailed packet and byte count distributions.
   * Standardized features exported to `Cleaned_DS/`.

2. **Review II — Validation & Linear Baselines (`Model_Validation.ipynb`):**
   * Stratified 5-Fold Cross-Validation with training-fold balanced resampling.
   * Multiple Linear Regression ($R^2 = 0.941$) for continuous rate prediction.
   * Logistic Regression baseline ($F_1 = 0.917$, $\text{ROC-AUC} = 0.970$).

3. **Review III — Advanced Architectures (`Dimentionality_Reduction.ipynb`):**
   * Principal Component Analysis (PCA) for 2D flow separation.
   * Unsupervised K-Means clustering ($K=3$) with Silhouette evaluation.
   * Random Forest champion ensemble ($F_1 = 0.956$, $\text{ROC-AUC} = 0.985$).
