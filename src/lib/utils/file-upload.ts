import { v4 as uuidv4 } from 'uuid';
import { put } from '@vercel/blob';

export async function uploadFile(
  file: File, 
  path: string, 
  maxSize = 10 * 1024 * 1024  // 10MB
): Promise<string> {
  // 文件大小验证
  if (file.size > maxSize) {
    throw new Error('文件大小不能超过10MB');
  }

  // 文件类型验证
  const allowedTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'text/plain', 
    'image/jpeg', 
    'image/png', 
    'image/gif'
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('不支持的文件类型');
  }

  // 生成唯一文件名
  const fileName = `${path}/${uuidv4()}-${file.name}`;

  // 上传到 Vercel Blob 存储
  const blob = await put(fileName, file, {
    access: 'public',
    addRandomSuffix: false,
  });

  return blob.url;
}
