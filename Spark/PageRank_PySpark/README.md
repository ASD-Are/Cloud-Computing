## Project Title: PageRank Implementation on GCP

### Project Overview
This project involves implementing the PageRank algorithm using Apache Spark on Google Cloud Platform (GCP). The objective is to understand the workings of the algorithm and optimize it using RDD partitioning.

## PART ONE – RUN USING PYSPARK

### 1. Set Up GCP Environment

#### 1.1 Create a Bucket
1. Open the GCP Console.
2. Navigate to the "Storage" section.
3. Create a new bucket and name it `bigdata_pagerank_pyspark`.

#### 1.2 Create a Dataproc Cluster
1. Open Cloud Shell from the GCP Console.
2. Authenticate with GCP:
   ```sh
   gcloud auth login
   ```
3. Create a Dataproc cluster:
   ```sh
   gcloud dataproc clusters create pagerank-cluster \
       --region=us-central1 \
       --zone=us-central1-a \
       --single-node \
       --master-machine-type=n1-standard-4 \
       --master-boot-disk-size=50GB \
       --image-version=1.5-debian10
   ```

### 2. Prepare the PySpark Script

#### 2.1 Create Input File
Create an input file named `input.txt` with the following content:
```
A B
A C
B C
C A
```

#### 2.2 Create the `pagerank.py` Script
1. Create a file named `pagerank.py` with the following content:
   ```python
   import re
   import sys
   from operator import add
   from pyspark.sql import SparkSession

   def computeContribs(urls, rank):
       num_urls = len(urls)
       for url in urls:
           yield (url, rank / num_urls)

   def parseNeighbors(urls):
       parts = re.split(r'\s+', urls)
       return parts[0], parts[1]

   if __name__ == "__main__":
       if len(sys.argv) != 3:
           print("Usage: pagerank <file> <iterations>", file=sys.stderr)
           sys.exit(-1)

       spark = SparkSession.builder.appName("PythonPageRank").getOrCreate()

       lines = spark.read.text(sys.argv[1]).rdd.map(lambda r: r[0])
       links = lines.map(lambda urls: parseNeighbors(urls)).distinct().groupByKey().cache()
       ranks = links.map(lambda url_neighbors: (url_neighbors[0], 1.0))

       for iteration in range(int(sys.argv[2])):
           contribs = links.join(ranks).flatMap(
               lambda url_urls_rank: computeContribs(url_urls_rank[1][0], url_urls_rank[1][1]))
           ranks = contribs.reduceByKey(add).mapValues(lambda rank: rank * 0.85 + 0.15)

       for (link, rank) in ranks.collect():
           print("%s has rank: %s." % (link, rank))

       spark.stop()
   ```

#### 2.3 Upload Files to GCP Bucket
1. Upload `input.txt` and `pagerank.py` to the bucket:
   ```sh
   gsutil cp input.txt gs://bigdata_pagerank_pyspark/
   gsutil cp pagerank.py gs://bigdata_pagerank_pyspark/
   ```

### 3. Submit the PySpark Job

Submit the PySpark job to the Dataproc cluster:
```sh
gcloud dataproc jobs submit pyspark gs://bigdata_pagerank_pyspark/pagerank.py \
    --cluster=pagerank-cluster \
    --region=us-central1 \
    -- gs://bigdata_pagerank_pyspark/input.txt 10
```

### 4. Confirm Output

Check the output files in the bucket to confirm the execution results.

---

## PART TWO – RUN USING SCALA

### 1. Set Up GCP Environment

#### 1.1 Create a Bucket
1. Open the GCP Console.
2. Navigate to the "Storage" section.
3. Create a new bucket and name it `bigdata_pagerank_scala`.

#### 1.2 Upload Input File
Upload `input.txt` to the bucket:
```sh
gsutil cp input.txt gs://bigdata_pagerank_scala/
```

### 2. Prepare the Scala Script

#### 2.1 SSH to the Cluster
1. Open Cloud Shell from the GCP Console.
2. SSH into the cluster:
   ```sh
   gcloud compute ssh --zone=us-central1-a <cluster-name>-m
   ```

#### 2.2 Update System Packages
Update the system's package list:
```sh
sudo apt-get update
```

#### 2.3 Install Scala and sbt
1. Install Scala:
   ```sh
   sudo apt-get install scala
   ```
2. Install sbt:
   ```sh
   echo "deb https://repo.scala-sbt.org/scalasbt/debian all main" | sudo tee /etc/apt/sources.list.d/sbt.list
   curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x642AC823" | sudo apt-key add
   sudo apt-get update
   sudo apt-get install sbt
   ```

### 3. Set Up Project Structure and Compile Code

1. Create project directories:
   ```sh
   mkdir pagerank
   cd pagerank
   mkdir -p src/main/scala
   ```

2. Create `build.sbt` file:
   ```sh
   vi build.sbt
   ```
   Add the following content:
   ```sbt
   name := "SparkPageRank"
   version := "1.0"
   scalaVersion := "2.12.10"
   libraryDependencies ++= Seq(
     "org.apache.spark" %% "spark-core" % "2.4.5",
     "org.apache.spark" %% "spark-sql" % "2.4.5"
   )
   ```

3. Create `SparkPageRank.scala`:
   ```sh
   vi src/main/scala/SparkPageRank.scala
   ```
   Add the following content:
   ```scala
   package org.apache.spark.examples

   import org.apache.spark.SparkContext._
   import org.apache.spark.{SparkConf, SparkContext}

   object SparkPageRank {

     def showWarning() {
       System.err.println(
         """WARN: This is a naive implementation of PageRank and is given as an example!
           |Please use the PageRank implementation found in org.apache.spark.graphx.lib.PageRank
           |for more conventional use.
         """.stripMargin)
     }

     def main(args: Array[String]) {
       if (args.length < 1) {
         System.err.println("Usage: SparkPageRank <file> <iter>")
         System.exit(1)
       }

       showWarning()

       val sparkConf = new SparkConf().setAppName("PageRank")
       val iters = if (args.length > 1) args(1).toInt else 10
       val ctx = new SparkContext(sparkConf)
       val lines = ctx.textFile(args(0), 1)

       val links = lines.map{ s =>
         val parts = s.split("\\s+")
         (parts(0), parts(1))
       }.distinct().groupByKey().cache()

       var ranks = links.mapValues(v => 1.0)

       for (i <- 1 to iters) {
         val contribs = links.join(ranks).values.flatMap{ case (urls, rank) =>
           val size = urls.size
           urls.map(url => (url, rank / size))
         }
         ranks = contribs.reduceByKey(_ + _).mapValues(0.15 + 0.85 * _)
       }

       val output = ranks.collect()
       output.foreach(tup => println(tup._1 + " has rank: " + tup._2 + "."))

       ctx.stop()
     }
   }
   ```

4. Compile the project:
   ```sh
   sbt package
   ```

### 4. Upload Compiled JAR to Google Cloud Storage

Upload the compiled JAR file to the bucket:
```sh
gsutil cp target/scala-2.12/sparkpagerank_2.12-1.0.jar gs://bigdata_pagerank_scala/
```

### 5. Submit Spark Job on Dataproc

Submit the Spark job to the Dataproc cluster:
```sh
gcloud dataproc jobs submit spark --cluster=pagerank-cluster --region=us-central1 \
    --jars=gs://bigdata_pagerank_scala/sparkpagerank_2.12-1.0.jar \
    --class=org.apache.spark.examples.SparkPageRank \
    -- gs://bigdata_pagerank_scala/input.txt 10
```

### Conclusion

This README file provides detailed instructions on setting up the environment, downloading the necessary programs and documentation, executing the PageRank algorithm using PySpark and Scala, and including screenshots of the execution results. Following these steps will help you successfully implement and run the PageRank algorithm on Google Cloud Platform using PySpark and Scala

### Testing
## PART One – RUN USING PySpark
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/3af53c3f-27d9-4feb-803a-a6a28cc5871a)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/200aac00-4813-4fe2-9e46-3098019555d2)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/c0a34359-0727-4321-802f-3603c7b95af8)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/5bbcb0ad-3e10-4f97-a719-39cd934fe1d8)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/ed97bdba-3944-43da-97e9-33cdba40bc76)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/53fd02ce-e408-47cb-a712-fc317d6c8856)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/780911ba-1bfd-4847-be85-df6873baa115)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/014fdff2-b105-4a89-bf99-19435e06698e)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/cdbb7166-d4a0-4e2f-af8c-8a3afe935c02)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/05b1ee3b-4a57-4380-b75c-54ddf776f370)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/4405b04a-89f5-4ac5-b7df-be53380457b9)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/ec761f91-b7a4-4c63-99b4-32dabc68c3a3)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/bf6368b2-cb2f-4751-9bb6-dd3aafc141b7)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/af059ce4-2f3c-42d4-9518-098911060c57)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/073bc260-a5c1-4970-8731-04c0cab199ec)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/7dfd37ef-fb4d-4a11-be21-3e83a90c6ea3)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/52a6496f-57d1-4460-b931-89602256cec9)
## PART Two – RUN USING Scala
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/177ab468-7128-4788-8df3-70f2aac0d6f4)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/abbbac3a-be35-4b8c-a37b-c2fdd6c5aba6)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/643103b4-48d9-441d-8b66-fe620bcf534f)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/b17bcc82-4b4f-4e2f-a133-9faf2e957a37)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/ce947fed-d85e-439e-ad0e-cc872b22a0d9)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/b339d031-cd59-4036-81c2-87e18ac2c767)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/63354893-9577-49f4-9482-545ea32f9daa)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/72d0fa1e-cb08-4915-839d-280b172115c6)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/2266a6a4-d36b-430a-8a2d-21289a470d3b)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/e4497f16-50f9-402d-bb3c-e7aa74e5c802)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/a1a4bd55-8f19-427f-862b-b2d013b7ddc3)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/466112a3-b92b-4ca0-bdf3-da3603e9c00d)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/67a3cbd3-b170-426d-9761-01cde53b71bf)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/b35b7d50-6817-4ccb-9ec0-b8e2dd189ecc)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/9ea7f4f0-7859-49b7-b60c-88e6ab1f2915)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/05464719-b05e-4af7-a665-7c9a2253f328)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/d64d937e-20ee-4230-945e-a5d9e9fb52d6)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/c712efb7-5de1-42cc-af14-fd025818bf70)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/ceed95f1-38c2-4c9c-ace8-f5e2552a8fa6)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/c8d9f453-973c-4670-8060-29832c7ec4cd)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/012dbd7a-1a83-40a5-9f1e-e4d55fd3026d)

# Appendix
[Google slide](https://docs.google.com/presentation/d/1Om9RyjRWfrc_HVHVcE_hLJe5DnZSlGPsZSC2bt_-AoY/edit?usp=sharing)









