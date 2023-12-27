"use client";

import { useState } from "react";

export default function UploadForm() {
	const [file, setFile] = useState<File>();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
  
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      if (base64) {
        const res = await fetch("/api/companies", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            company: {
              name: "test",
              logo: base64,
            },
          }),
        });
        // handle the error
        if (!res.ok) throw new Error(await res.text());
      }
    };
    reader.readAsDataURL(file);
  };

	return (
		<form onSubmit={onSubmit}>
			<input
				type="file"
				name="file"
				accept="image/*"
				onChange={(e) => {
					const selectedFile = e.target.files?.[0];
					if (selectedFile) {
						// Check file size (less than 1MB)
						if (selectedFile.size > 1024 * 1024) {
							alert("File size should be less than 1MB");
							return;
						}

						// Check file type (e.g., 'image/png')
						if (!selectedFile.type.startsWith("image/")) {
							alert("Invalid file type. Only PNG images are allowed");
							return;
						}

						setFile(selectedFile);
					}
				}}
			/>
			<input type="submit" value="Upload" />
		</form>
	);
}
