resource "aws_s3_bucket" "contentful-backup" {
  count  = var.create_contentful_backup_bucket ? 1 : 0
  bucket = var.dns_entry
  acl    = "private"

  versioning {
    enabled = false
  }

  # Encrypt the data at rest. We use the default Service Side Encryption
  # in order to minimize issues between CloudFront and KMS
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "researchhub-contentful-backup"
    },
  )
}

resource "aws_s3_bucket_policy" "cdn_access_policy" {
  count  = var.create_contentful_backup_bucket ? 1 : 0
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.s3_policy.json
}

# Policy to allow access to the bucket
# Note: Used the default policy that was set originally.
# TO DO: Make this more secure? Should only the lambda have access ? 
data "aws_iam_policy_document" "s3_policy" {
  count  = var.create_contentful_backup_bucket ? 1 : 0
  statement {
    actions   = ["s3:*"]
    resources = [
      "${aws_s3_bucket.contentful-backup.arn}",
      "${aws_s3_bucket.contentful-backup.arn}/*"
    ]

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    condition {
      test = "Bool"
      variable = "aws:SecureTransport"
      values = [
        "false"
      ]
    }
  }
}