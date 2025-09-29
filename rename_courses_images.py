import os
import sys

# 设置图片文件夹路径
folder_path = '/Users/dongqingzhai/Desktop/UAI_project/frontend/src/assets/images/courses'

# 检查文件夹是否存在
if not os.path.exists(folder_path):
    print(f"错误：文件夹 {folder_path} 不存在")
    sys.exit(1)

# 获取文件夹中的所有文件
files = os.listdir(folder_path)

# 重命名文件计数
renamed_count = 0

# 遍历所有文件
for filename in files:
    # 检查文件名是否包含'xuhuan'
    if 'xuhuan' in filename:
        # 构建旧文件路径和新文件路径
        old_path = os.path.join(folder_path, filename)
        new_filename = filename.replace('xuhuan', 'unreal')
        new_path = os.path.join(folder_path, new_filename)
        
        # 重命名文件
        os.rename(old_path, new_path)
        print(f"重命名: {filename} -> {new_filename}")
        renamed_count += 1

print(f"重命名完成！总共重命名了 {renamed_count} 个文件。")