import os
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader, TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def load_documents(folder_path):
    documents = []
    for root, _, files in os.walk(folder_path):
        for file in files:
            path = os.path.join(root, file)
            if file.endswith(".pdf"):
                loader = PyPDFLoader(path)
            elif file.endswith(".txt"):
                loader = TextLoader(path, encoding="utf-8")
            else:
                # handle other file types or skip
                continue
            documents.extend(loader.load())
    return documents

def chunk_documents(documents, chunk_size=500, chunk_overlap=50):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    chunks = []
    for doc in documents:
        chunks.extend(text_splitter.split_documents([doc]))
    return chunks

def create_faiss_index(chunks):
    embeddings = OpenAIEmbeddings(model="text-embedding-ada-002", openai_api_key=OPENAI_API_KEY)
    faiss_index = FAISS.from_documents(chunks, embeddings)
    faiss_index.save_local("faiss_index")
    print("FAISS index saved locally as 'faiss_index'")
    return faiss_index

if __name__ == "__main__":
    docs = load_documents("./docs")  # Put your docs in ./docs folder
    print(f"Loaded {len(docs)} documents")
    chunks = chunk_documents(docs)
    print(f"Split into {len(chunks)} chunks")
    create_faiss_index(chunks)
