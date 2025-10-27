export interface TodoTask {
  id: string;
  title: string;
  dueDate: string;
  isUrgent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyNews {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
}