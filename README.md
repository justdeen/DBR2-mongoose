## 💫 Overview
This repo showcases a simple implementation of a one-to-many relationship between two MongoDB collections (models). The relationship is established through cross-referencing, where each document in one collection contains a reference to multiple documents in the other collection.

## 🗄 Database Relationship
The database relationship implemented in this repository is one-to-many, where:

- One document in the parents' collection can have multiple related documents in the children's collection.
- Each document in the children's collection is related to only one document in the parents' collection.
