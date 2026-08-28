import { useEffect, useRef, useState } from "react";
import { fetchGeocoding } from "../api/weather";
import useCitySuggestions from "../hooks/useCitySuggestions";

const formatSuggestionLabel = (suggestion) => {
	const secondary = [suggestion.region, suggestion.country]
		.filter(Boolean)
		.join(", ");
	return secondary ? `${suggestion.name}, ${secondary}` : suggestion.name;
};

const CitySearchInput = ({
	city,
	setCity,
	onSelectCoordinates,
	placeholder = "Search city",
	error,
	setError,
	autoFocus = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const wrapperRef = useRef(null);
	const inputRef = useRef(null);
	const listRef = useRef(null);

	const { suggestions, loading, error: suggestionError, minQueryLength } =
		useCitySuggestions(city);

	useEffect(() => {
		if (autoFocus) {
			setIsOpen(true);
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [autoFocus]);

	// Reset active index when suggestions change
	useEffect(() => { setActiveIndex(-1); }, [suggestions]);

	useEffect(() => {
		const handleOutsideClick = (e) => {
			if (!wrapperRef.current?.contains(e.target)) setIsOpen(false);
		};
		document.addEventListener("mousedown", handleOutsideClick);
		document.addEventListener("touchstart", handleOutsideClick);
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
			document.removeEventListener("touchstart", handleOutsideClick);
		};
	}, []);

	const handleSelectSuggestion = (suggestion) => {
		setCity(formatSuggestionLabel(suggestion));
		setError("");
		setIsOpen(false);
		setActiveIndex(-1);
		onSelectCoordinates({
			lat: suggestion.latitude,
			lng: suggestion.longitude,
			cityName: suggestion.name,
			country: suggestion.country,
			displayName: formatSuggestionLabel(suggestion),
		});
	};

	const handleKeyDown = (e) => {
		if (!isOpen || suggestions.length === 0) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((i) => Math.max(i - 1, 0));
		} else if (e.key === "Enter" && activeIndex >= 0) {
			e.preventDefault();
			handleSelectSuggestion(suggestions[activeIndex]);
		} else if (e.key === "Escape") {
			setIsOpen(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		if (!city.trim()) { setError("Please enter a city name."); return; }
		if (suggestions.length > 0) { handleSelectSuggestion(suggestions[0]); return; }
		try {
			setIsSubmitting(true);
			const geocoding = await fetchGeocoding(city.trim());
			const firstResult = geocoding?.results?.[0];
			if (!firstResult) { setError("City not found. Try another name."); return; }
			const fallbackLabel = [firstResult.name, firstResult.admin1 || firstResult.admin2, firstResult.country]
				.filter(Boolean).join(", ");
			onSelectCoordinates({
				lat: firstResult.latitude,
				lng: firstResult.longitude,
				cityName: firstResult.name,
				country: firstResult.country,
				displayName: fallbackLabel,
			});
		} catch (err) {
			setError(err.message || "Unable to resolve city.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const showDropdown = isOpen && city.trim().length > 0;

	return (
		<div className="city-search-root" ref={wrapperRef}>
			<div className="city-search-field">
				<span className="city-search-icon" aria-hidden="true">🔍</span>
				<input
					ref={inputRef}
					type="text"
					className="city-search-input"
					placeholder={placeholder}
					value={city}
					autoComplete="off"
					spellCheck={false}
					onChange={(e) => {
						setCity(e.target.value);
						setError("");
						setIsOpen(true);
					}}
					onFocus={() => setIsOpen(true)}
					onKeyDown={handleKeyDown}
					aria-autocomplete="list"
					aria-expanded={showDropdown}
				/>
				{city && (
					<button
						type="button"
						className="city-search-clear"
						onClick={() => { setCity(""); setIsOpen(false); inputRef.current?.focus(); }}
						aria-label="Clear search"
					>✕</button>
				)}
			</div>

			{showDropdown && (
				<ul className="city-dropdown-list" ref={listRef} role="listbox">
					{city.trim().length < minQueryLength ? (
						<li className="city-dropdown-hint">
							Type at least {minQueryLength} letters…
						</li>
					) : loading ? (
						<li className="city-dropdown-hint">
							<span className="city-spinner" aria-hidden="true" /> Searching…
						</li>
					) : suggestionError ? (
						<li className="city-dropdown-hint error">{suggestionError}</li>
					) : suggestions.length > 0 ? (
						suggestions.map((s, i) => (
							<li
								key={s.id}
								role="option"
								aria-selected={i === activeIndex}
								className={`city-dropdown-item${i === activeIndex ? " active" : ""}`}
								onMouseDown={() => handleSelectSuggestion(s)}
								onMouseEnter={() => setActiveIndex(i)}
							>
								<span className="city-dropdown-name">{s.name}</span>
								{(s.region || s.country) && (
									<span className="city-dropdown-meta">
										{[s.region, s.country].filter(Boolean).join(", ")}
									</span>
								)}
							</li>
						))
					) : (
						<li className="city-dropdown-hint">No cities found for "{city}"</li>
					)}
				</ul>
			)}

			<div className="city-search-actions">
				<button
					type="button"
					className="city-search-submit"
					onClick={handleSubmit}
					disabled={loading || isSubmitting || !city.trim()}
				>
					{loading || isSubmitting ? (
						<><span className="city-spinner" aria-hidden="true" /> Searching…</>
					) : (
						<>Use city</>
					)}
				</button>
				{error && <p className="city-search-error" role="alert">{error}</p>}
			</div>
		</div>
	);
};

export default CitySearchInput;
