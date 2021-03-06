import { Database } from "../arangojs";
import { DocumentCollection } from "../collection";
import { expect } from "chai";

describe("Managing indexes", function() {
  // create database takes 11s in a standard cluster
  this.timeout(20000);

  let db: Database;
  let dbName = `testdb_${Date.now()}`;
  let collection: DocumentCollection;
  let collectionName = `collection-${Date.now()}`;
  before(done => {
    db = new Database({
      url: process.env.TEST_ARANGODB_URL || "http://localhost:8529",
      arangoVersion: Number(process.env.ARANGO_VERSION || 30000)
    });
    db.createDatabase(dbName).then(() => {
      db.useDatabase(dbName);
      collection = db.collection(collectionName);
      collection
        .create()
        .then(() => void done())
        .catch(done);
    });
  });
  after(done => {
    db.useDatabase("_system");
    db
      .dropDatabase(dbName)
      .then(() => void done())
      .catch(done);
  });
  describe("collection.createIndex", () => {
    it("should create a index of given type", done => {
      collection
        .createIndex({
          type: "hash",
          fields: ["value0"]
        })
        .then(info => {
          expect(info).to.have.property("id");
          expect(info).to.have.property("type", "hash");
          expect(info).to.have.property("fields");
          expect(info.fields).to.eql(["value0"]);
          expect(info).to.have.property("isNewlyCreated", true);
        })
        .then(() => done())
        .catch(done);
    });
  });
  describe("collection.createHashIndex", () => {
    it("should create a hash index", done => {
      collection
        .createHashIndex(["value"])
        .then(info => {
          expect(info).to.have.property("id");
          expect(info).to.have.property("type", "hash");
          expect(info).to.have.property("fields");
          expect(info.fields).to.eql(["value"]);
          expect(info).to.have.property("isNewlyCreated", true);
        })
        .then(() => done())
        .catch(done);
    });
  });
  describe("collection.createSkipList", () => {
    it("should create a skiplist index", done => {
      collection
        .createSkipList(["value"])
        .then(info => {
          expect(info).to.have.property("id");
          expect(info).to.have.property("type", "skiplist");
          expect(info).to.have.property("fields");
          expect(info.fields).to.eql(["value"]);
          expect(info).to.have.property("isNewlyCreated", true);
        })
        .then(() => done())
        .catch(done);
    });
  });
  describe("collection.createPersistentIndex", () => {
    it("should create a persistent index", done => {
      collection
        .createPersistentIndex(["value"])
        .then(info => {
          expect(info).to.have.property("id");
          expect(info).to.have.property("type", "persistent");
          expect(info).to.have.property("fields");
          expect(info.fields).to.eql(["value"]);
          expect(info).to.have.property("isNewlyCreated", true);
        })
        .then(() => done())
        .catch(done);
    });
  });
  describe("collection.createGeoIndex", () => {
    it("should create a geo1 index", done => {
      collection
        .createGeoIndex(["value"])
        .then(info => {
          expect(info).to.have.property("id");
          expect(info).to.have.property("type", "geo1");
          expect(info).to.have.property("fields");
          expect(info.fields).to.eql(["value"]);
          expect(info).to.have.property("isNewlyCreated", true);
        })
        .then(() => done())
        .catch(done);
    });
    it("should create a geo2 index", done => {
      collection
        .createGeoIndex(["value1", "value2"])
        .then(info => {
          expect(info).to.have.property("id");
          expect(info).to.have.property("type", "geo2");
          expect(info).to.have.property("fields");
          expect(info.fields).to.eql(["value1", "value2"]);
          expect(info).to.have.property("isNewlyCreated", true);
        })
        .then(() => done())
        .catch(done);
    });
  });
  describe("collection.createFulltextIndex", () => {
    it("should create a fulltext index", done => {
      collection
        .createFulltextIndex(["value"])
        .then(info => {
          expect(info).to.have.property("id");
          expect(info).to.have.property("type", "fulltext");
          expect(info).to.have.property("fields");
          expect(info.fields).to.eql(["value"]);
          expect(info).to.have.property("isNewlyCreated", true);
        })
        .then(() => done())
        .catch(done);
    });
  });
  describe("collection.index", () => {
    it("should return information about a index", done => {
      collection
        .createHashIndex(["test"])
        .then(info => {
          return collection.index(info.id).then(index => {
            expect(index).to.have.property("id", info.id);
            expect(index).to.have.property("type", info.type);
          });
        })
        .then(() => done())
        .catch(done);
    });
  });
  describe("collection.indexes", () => {
    it("should return a list of indexes", done => {
      collection
        .createHashIndex(["test"])
        .then(index => {
          return collection.indexes().then(indexes => {
            expect(indexes).to.be.instanceof(Array);
            expect(indexes).to.not.be.empty;
            expect(
              indexes.filter((i: any) => i.id === index.id).length
            ).to.equal(1);
          });
        })
        .then(() => done())
        .catch(done);
    });
  });
  describe("collection.dropIndex", () => {
    it("should drop existing index", done => {
      collection
        .createHashIndex(["test"])
        .then(info => {
          return collection.dropIndex(info.id).then(index => {
            expect(index).to.have.property("id", info.id);
            return collection.indexes().then(indexes => {
              expect(indexes).to.be.instanceof(Array);
              expect(indexes).to.not.be.empty;
              expect(
                indexes.filter((i: any) => i.id === index.id).length
              ).to.equal(0);
            });
          });
        })
        .then(() => done())
        .catch(done);
    });
  });
});
