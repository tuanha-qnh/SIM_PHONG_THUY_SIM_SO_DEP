import { GoogleGenAI, Type } from "@google/genai";
import { FengShuiAnalysis } from "../types.ts";

// NOTE: In a real production app, never expose API keys on the client side.
// This is for demonstration using the provided environment variable pattern.
const apiKey = process.env.API_KEY || ''; 

export const analyzeSimFengShui = async (
  phoneNumber: string,
  birthYear: string,
  gender: string
): Promise<FengShuiAnalysis> => {
  if (!apiKey) {
    // Fallback for demo if no key is present
    return new Promise(resolve => setTimeout(() => resolve({
      score: 8.5,
      element: "Kim",
      interpretation: "Sim này mang lại sự cân bằng, tài lộc ổn định. (Chế độ Demo - Hãy nhập API Key để có kết quả thực)",
      compatibility: "Hợp với người mệnh Thủy và Thổ."
    }), 1500));
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Đóng vai một chuyên gia phong thủy kinh dịch Việt Nam. Hãy phân tích số điện thoại ${phoneNumber} cho chủ nhân sinh năm ${birthYear}, giới tính ${gender}.
    Hãy đưa ra kết quả dưới dạng JSON với cấu trúc sau:
    {
      "score": (số điểm thang 10),
      "element": (ngũ hành của số sim),
      "interpretation": (lời bình ngắn gọn dưới 50 từ về ý nghĩa hung cát),
      "compatibility": (lời khuyên hợp khắc)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            element: { type: Type.STRING },
            interpretation: { type: Type.STRING },
            compatibility: { type: Type.STRING },
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as FengShuiAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      score: 5,
      element: "Không xác định",
      interpretation: "Hiện tại hệ thống đang bận, vui lòng thử lại sau.",
      compatibility: "N/A"
    };
  }
};