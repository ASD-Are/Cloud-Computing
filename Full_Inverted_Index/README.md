## Project Description
This project aims to create a full inverted index using Hadoop MapReduce, enabling efficient text processing and indexing for large datasets.

## Design
### Architecture:
Hadoop Ecosystem: HDFS for storage, MapReduce for processing.
### Components:
- Mapper: Processes input and generates intermediate key-value pairs.
- Combiner: Optional, reduces the amount of data transferred to the reducer.
- Reducer: Aggregates intermediate results to produce the final output.
### Data Flow:
- Input files -> Mapper -> Combiner (if used) -> Reducer -> Output

### SSH Connection and Setup
**Step 1:** Connect to the VM instance using SSH. If public key permission is denied, use the following commands:

```sh
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 0600 ~/.ssh/authorized_keys
```
Input Files and Java Files Setup
**Step 2:** Create input files and necessary Java files for the task:
```sh
vi file0
vi file1
vi file2
```
# Implementation
- Job Configuration (InvertedIndex.java)
  - Main Class (InvertedIndex):
    - Extends Configured and implements Tool.
    - Configures job with Mapper, Reducer, input, and output paths.
    - Uses ToolRunner.run to execute the job.
- Mapper (InvertedIndexMapper.java)
  - Mapper Class (InvertedIndexMapper):
    - Extends Mapper<Object, Text, Text, Text>.
    - Reads each line of input file, obtains filename.
    - Splits line into words using whitespace.
    - Combines filename and position into a single string.
    - Outputs word and location as key-value pairs (Text).
- Reducer (InvertedIndexReducer.java)
  - Reducer Class (InvertedIndexReducer):
    - Extends Reducer<Text, Text, Text, Text>.
    - Receives word and list of locations.
    - Collects unique locations into a Set to remove duplicates.
    - Converts set of locations to a string and writes to context with word as key.
# Requirement
- Java
- Access to Hadoop cluster or VM instance
  ![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/e86a5932-a00c-4196-8499-7d460d6053f0)
```sh
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 0600 ~/.ssh/authorized_keys
```

![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/a6779252-8720-4cb9-8fa9-76ae572c0643)

- Hadoop 3.4.0
  - Hadoop Setup and Job Configuration
  - Navigate to Hadoop-3.4.0/(or current installed version in your device) and proceed with Java files for MapReduce.

# Execution (Testing)
### Compilation and Job Submission
**Step 3:** Compile Java Code:
```sh
# Navigate to directory containing Java source files
javac -classpath $(~/hadoop-3.4.0/bin/hadoop classpath) *.java
```
Create JAR File:
```sh
jar cf inverted-index.jar *.class
```
**Step 4:** Copy files to Hadoop cluster and run job
```sh
# Navigate to Hadoop home directory
cd ~/hadoop-3.4.0

# Create necessary directories in HDFS
bin/hdfs dfs -mkdir /user
bin/hdfs dfs -mkdir /user/adagniew407
bin/hdfs dfs -mkdir /user/adagniew407/fullinvertedindexcalculation
bin/hdfs dfs -mkdir /user/adagniew407/fullinvertedindexcalculation/input

# Upload Input Files to HDFS
bin/hdfs dfs -put ~/InvertedIndex/file0 /user/adagniew407/fullinvertedindexcalculation/input
bin/hdfs dfs -put ~/InvertedIndex/file1 /user/adagniew407/fullinvertedindexcalculation/input
bin/hdfs dfs -put ~/InvertedIndex/file2 /user/adagniew407/fullinvertedindexcalculation/input

# Run the MapReduce job with created JAR file
bin/hadoop jar inverted-index.jar InvertedIndex /user/adagniew407/fullinvertedindexcalculation/input /user/adagniew407/fullinvertedindexcalculation/output

# Verify Output
bin/hdfs dfs -ls /user/adagniew407/fullinvertedindexcalculation/output
bin/hdfs dfs -cat /user/adagniew407/fullinvertedindexcalculation/output/part-*
```
Below are some images which are part of the test result.
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/060d3c29-572d-4dc3-9029-e1d01280cbc1)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/0c60289e-9121-4ea2-a1a9-c0b2bed02cd5)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/a850df4c-9393-45e2-b102-7eabb2334d22)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/3e811e57-9947-46ae-8e8c-4ed160960ebe)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/05b7deac-8691-441f-bf44-bac21f38c682)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/5d57cb40-8cdd-4bcc-b9f2-fb800c1be758)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/933d3b9d-74d7-4855-aae8-359b8e47c492)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/4db3943e-095e-4992-99b3-8aaba9f4063d)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/6cc69e46-6c19-4852-9d3c-b6cc74cfa58f)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/ea6683f1-eeaa-458f-96f9-4df98d4480c4)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/aeedc80c-d47c-4e0a-a7e1-4120d95168aa)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/38dc471f-4051-4c21-aca7-937ac9e57521)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/125c9d15-738f-45d0-9d8f-3df426976893)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/5750d85e-ad3f-4592-a98c-e61cc0ab6b27)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/4f149090-088a-44f9-9468-700d05574654)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/0f4e84a4-7698-4790-bf4d-7a7836cd5d25)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/b6b25ff1-2870-47ff-903c-539bbf27b4b1)

# Future Enhancement
Potential enhancements include optimizing mapper and reducer algorithms for improved performance and scalability.

# Detail Design Presentation
[Google slide for full inverted indexing using Hadoop](https://docs.google.com/presentation/d/1tzJHOO9LtK12zy-dZr3vuItYmQ9z2fkC5fzz3hhtYcU/edit?usp=sharing)

# Appendix



