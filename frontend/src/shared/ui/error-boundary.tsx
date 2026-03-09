import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/shared/ui/components/ui/button";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("ErrorBoundary caught:", error, info);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback;

			return (
				<div className="flex h-full min-h-40 flex-col items-center justify-center gap-4 p-8">
					<div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
						<AlertTriangle className="size-7 text-destructive" />
					</div>
					<div className="text-center">
						<h3 className="text-sm font-semibold">Что-то пошло не так</h3>
						<p className="mt-1 max-w-sm text-xs text-muted-foreground">
							{this.state.error?.message || "Произошла неизвестная ошибка"}
						</p>
					</div>
					<Button variant="outline" size="sm" onClick={this.handleReset}>
						<RotateCcw className="size-3.5" />
						Попробовать снова
					</Button>
				</div>
			);
		}

		return this.props.children;
	}
}
