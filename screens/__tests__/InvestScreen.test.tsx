import React from "react";
import {
  screen,
  render,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { backendService } from "@/services";
import { emitter } from "@/services/eventEmitter";
import InvestScreen from "../InvestScreen";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
  },
}));

jest.mock("@/services", () => ({
  backendService: {
    getFunds: jest.fn(),
    makeAllocation: jest.fn(),
  },
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

jest.mock("@/services/eventEmitter", () => ({
  emitter: {
    emit: jest.fn(),
  },
}));

const mockFunds = [
  { id: 1, name: "Fund A" },
  { id: 2, name: "Fund B" },
];

describe("InvestScreen", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
    (backendService.getFunds as jest.Mock).mockResolvedValue(mockFunds);
  });

  const renderScreen = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <InvestScreen />
      </QueryClientProvider>,
    );

  it("renders loading state initially", async () => {
    renderScreen();
    expect(screen.getByText("Loading..")).toBeTruthy();
  });

  it("renders form with funds after loading", async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText("Fund A")).toBeTruthy();
      expect(screen.getByText("Fund B")).toBeTruthy();
    });

    expect(
      screen.getByPlaceholderText(
        "Enter investment amount (whole pounds only)",
      ),
    ).toBeTruthy();
  });

  it("shows validation errors for empty submission", async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText("Fund A")).toBeTruthy();
    });

    const sendButton = screen.getByText("Send");
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(screen.getByText("Amount is required")).toBeTruthy();
      expect(screen.getByText("Please select a fund")).toBeTruthy();
    });
  });

  it("shows validation error for invalid amount", async () => {
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText("Fund A")).toBeTruthy();
    });

    const amountInput = screen.getByPlaceholderText(
      "Enter investment amount (whole pounds only)",
    );
    fireEvent.changeText(amountInput, "12.34");

    const sendButton = screen.getByText("Send");
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a whole number (no decimals)"),
      ).toBeTruthy();
    });
  });

  it("successfully submits form with valid data", async () => {
    (backendService.makeAllocation as jest.Mock).mockResolvedValue({});

    renderScreen();

    await waitFor(() => {
      expect(screen.getByText("Fund A")).toBeTruthy();
    });

    const amountInput = screen.getByPlaceholderText(
      "Enter investment amount (whole pounds only)",
    );
    fireEvent.changeText(amountInput, "100");

    fireEvent.press(screen.getByText("Fund A"));

    const sendButton = screen.getByText("Send");
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(backendService.makeAllocation).toHaveBeenCalledWith(100, 1);
      expect(router.back).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(emitter.emit).toHaveBeenCalledWith("investment-allocated");
    });
  });

  it("shows error toast when submission fails", async () => {
    const errorMessage = "Investment failed";
    (backendService.makeAllocation as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    renderScreen();

    await waitFor(() => {
      expect(screen.getByText("Fund A")).toBeTruthy();
    });

    const amountInput = screen.getByPlaceholderText(
      "Enter investment amount (whole pounds only)",
    );
    fireEvent.changeText(amountInput, "100");
    fireEvent.press(screen.getByText("Fund A"));

    const sendButton = screen.getByText("Send");
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    });
  });
});
