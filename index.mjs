import { WebClient } from "@slack/web-api";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const S3_BUCKET = process.env.S3_BUCKET;
const S3_OBJECT_KEY = process.env.S3_OBJECT_KEY;
const SLACK_OAUTH_TOKEN = process.env.SLACK_OAUTH_TOKEN;
const CHANNEL = process.env.CHANNEL;

export const handler = async (event) => {
  // S3に保存したファイルを取得
  const file = await getFileBlobFromS3(S3_BUCKET, S3_OBJECT_KEY);

  const client = new WebClient(SLACK_OAUTH_TOKEN);

  // ファイルをSlackにアップロード
  try {
    await client.files.uploadV2({
      channel_id: CHANNEL,
      file,
      initial_comment: "今週のサマリーレポートです",
      filename: `summary_report_${Date.now()}.png`,
    });
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify("Ok"),
  };
};

async function getFileBlobFromS3(Bucket, Key) {
  const client = new S3Client();

  const input = { Bucket, Key };

  const command = new GetObjectCommand(input);
  const res = await client.send(command);
  const blob = await res.Body;

  return blob;
}
