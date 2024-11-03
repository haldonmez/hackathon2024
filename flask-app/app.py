from flask import Flask, request, jsonify
import pandas as pd
from langchain import PromptTemplate
from langchain.chains.question_answering import load_qa_chain
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import os
from google.oauth2 import service_account
import google.generativeai as genai
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Set maximum request size to handle larger payloads (adjust as necessary)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit

# Load the JSON key from the environment variable
service_account_info = json.loads(os.getenv("GOOGLE_SERVICE_ACCOUNT_KEY"))

# Create credentials using the service account information
credentials = service_account.Credentials.from_service_account_info(service_account_info)

# Configure Google Generative AI client with credentials
genai.configure(credentials=credentials)

# Instantiate the Google Generative AI model
model = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=None,  # No API key needed since credentials are provided
    temperature=0.2,
    convert_system_message_to_human=True,
    credentials=credentials  # Pass credentials here
)

# Load and process the PDF document
pdf_loader = PyPDFLoader("py_scripts/24095558_2024_yks.pdf")
pages = pdf_loader.load_and_split()

# Split text into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
context = "\n\n".join(str(p.page_content) for p in pages)
texts = text_splitter.split_text(context)

# Set up embeddings with credentials
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=None,  # No API key needed since credentials are provided
    credentials=credentials  # Pass credentials here
)

# Create a vector index using embeddings
vector_index = Chroma.from_texts(texts, embeddings).as_retriever(search_kwargs={"k": 5})

# Define a custom prompt template for more controlled responses
template = """ 
Sondaki soruyu yanıtlamak için aşağıdaki bağlam parçalarını kullanın. 
Eğer cevabı bilmiyorsanız, sadece bilmediğinizi söyleyin; bir cevap uydurmaya çalışmayın. Kazanımlar içinden bir veya çok sayıda kazanımı verilen soruyla eşleştirin.
Cevabınızı mümkün olduğunca kısa tutun.
Her zaman türkçe dilini kullan.

{context}
Question: {question}
Helpful Answer:"""
QA_CHAIN_PROMPT = PromptTemplate.from_template(template)

# Configure the QA chain with the Google Gemini model
qa_chain = RetrievalQA.from_chain_type(
    model,
    retriever=vector_index,
    return_source_documents=True,
    chain_type_kwargs={"prompt": QA_CHAIN_PROMPT}
)

@app.route('/rag-process', methods=['POST'])
def rag_process():
    try:
        data = request.json
        page = data.get("page")
        text = data.get("text")

        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Formulate the question based on the page content
        question = f"""{text} Verilen Soru göz önünde bulunarak kazanımlarını tek tek her soru için belirle.
                            Örnek Çıktı: 
                                        **Sayfa Numarası**: Hangi sayfada yer aldığı.
                                        **Soru Numarası**: Sorunun Bulunduğu sıra.
                                        **Ana Konu**: Hangi temel konuya ait? (Örneğin: Türk Dili ve Edebiyatı, Tarih, Matematik).
                                        **Alt Konu**: Belirlenen konunun hangi alt dalına ait? (Örneğin: Matematik -> Geometri, Analitik Geometri).
                                        **Kazanımlar**: Tespit ettiğin kazanımlar. Her soru başına ayrı olmak üzere."""

        # Use the QA chain to process the query with the document context
        result = qa_chain({"query": question, "documents": [text]})

        # Return the processed answer
        return jsonify(result["result"])

    except Exception as e:
        # Log error to console for debugging
        print("Error processing request:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8000)
