import aws from "aws-sdk";
import s3Client from "../../config/awsConfig.js";

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const generatePresignedUrl = async (req, res) => {
  const { fileName, fileType } = req.query;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${Date.now().toString()}_${fileName}`,
    Expires: 60,
    ContentType: fileType,
  };

  try {
    const url = await s3Client.getSignedUrlPromise("putObject", params);
    res.json({ url, key: params.Key });
  } catch (err) {
    // Handle errors
    console.error("Error generating pre-signed URL", err);
    res.status(500).send("Error generating pre-signed URL");
  }
};

export { generatePresignedUrl };
