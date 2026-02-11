"use client";

import React, { useEffect, useRef } from 'react';
import EditorJS, { type OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import ImageTool from '@editorjs/image';
import CodeTool from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import PDFTool from '@/lib/pdf/pdf-tool-refactored';
import Embed from '@editorjs/embed';
import LinkTool from '@editorjs/link';
import { imageUploader } from '@/lib/editor-upload';
import { pdfUploader } from '@/lib/editor-upload';

interface EditorProps {
	data?: OutputData;
	onChange?: (data: OutputData) => void;
}

export const Editor: React.FC<EditorProps> = ({ data, onChange }) => {
	const editorRef = useRef<EditorJS | null>(null);
	const holder = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!holder.current) return;

		let isDestroyed = false;

		const initializeEditor = async () => {
			try {
				if (isDestroyed) return;

				const editor = new EditorJS({
					holder: holder.current!,
					data,
					autofocus: true,
					tools: {
						header: Header,
						list: List,
						quote: Quote,
						code: CodeTool,
						inlineCode: InlineCode,
						embed: Embed,
						linkTool: LinkTool,
						image: {
							class: ImageTool,
							config: {
								uploader: imageUploader,
							},
						},
						pdf: {
							class: PDFTool,
							config: {
								uploader: pdfUploader,
							},
						},
					},
					onChange: async () => {
						if (editorRef.current) {
							const output = await editorRef.current.save();
							if (output) {
								onChange?.(output);
							}
						}
					},
				});

				if (!isDestroyed) {
					editorRef.current = editor;
				}
			} catch (error) {
				console.error('Failed to initialize editor:', error);
			}
		};

		initializeEditor();

		return () => {
			isDestroyed = true;
			if (editorRef.current && typeof editorRef.current.destroy === 'function') {
				editorRef.current.destroy();
			}
			editorRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onChange]);

	return <div ref={holder} className="editorjs" />;
};
