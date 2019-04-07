import sys
import math
import os
import numpy as np


############################################################################
def give_max_min(observed_data, variable, depth):
	
	if observed_data:
		observed_data = np.asarray(observed_data)
		yobs = observed_data[:, 0]
		xobs = observed_data[:, 1]
		xmin_obsdata = np.nanmin(xobs)
		ymin_obsdata = np.nanmin(yobs)
		xmax_obsdata = np.nanmax(xobs)
		ymax_obsdata = np.nanmax(yobs)
	else:
		xmin_obsdata, ymin_obsdata = 999999., 999999.
		xmax_obsdata, ymax_obsdata = -999999., -999999.

	xmax_model = np.nanmax(variable)
	ymin_model = np.nanmin(depth)
	xmin_model = np.nanmin(variable)
	ymax_model = np.nanmax(depth)
	
	xmax = max(xmax_obsdata, xmax_model)
	xmax = int(xmax / 10.) * 10. + 10.
	xmin = min(xmin_obsdata, xmin_model)
	xmin = min(0., xmin)
	
	ymax = max(ymax_obsdata, ymax_model)
	ymax = int(ymax / 1000.) * 1000. + 2 * 500.
	ymin = min(ymin_obsdata, ymin_model)
	ymin = int(ymin / 1000.) * 1000. - 2 * 500.
	
	return xmin, xmax, ymin, ymax


################################################################################
def convert_opt_filename(opt, bcl, iterat, dirname):

	if opt == "Geometry":
		dirname = os.path.join(dirname, "OUTPUT-Geom_")

	elif opt == "Temperature":
		if bcl == "HF_bottom":
			dirname = os.path.join(dirname,  "OUTPUT-TempHF_")
		elif bcl == "T_bottom":
			dirname = os.path.join(dirname,  "OUTPUT-TempTb_")

	elif opt == "Pressure":
		if iterat == str(1) or iterat == 1:
			dirname = os.path.join(dirname,  "OUTPUT-PressNoGL_")
		else:
			dirname = os.path.join(dirname,  "OUTPUT-PressGL_")

	return dirname


################################################################################
def truncate(val, significant_digits):

	precision = math.pow(10,significant_digits)
	val = math.floor(val * precision)
	val /= precision

	return val


################################################################################
def truncate_list(val_list, significant_digits):

	for i in range(len(val_list)):
		val_list[i] = truncate(val_list[i], significant_digits)

	return val_list


################################################################################
def truncate_list_list(val_list, significant_digits):

	for i in range(len(val_list)):
		for j in range(len(val_list[i])):
			val_list[i][j] = truncate(val_list[i][j], significant_digits)

	return val_list


################################################################################
def plot_burial_depth_min():

	return plot_depth_min()


################################################################################
def plot_depth_min():

	return 4000.

################################################################################
# def plot_age_min():
#
# 	return 500


################################################################################
def plot_temperature_max():

	return 200.


################################################################################
def plot_pressure_max():

	return 160.


################################################################################
def convert_Ma_in_seconds(val):
	# seconds in 1 Ma
	# result = val * 60 * 60 * 24 * 365.2425 * 1e6
	result = val * 60 * 60 * 24 * 365.2425 * 1e6
	return result


################################################################################
def convert_seconds_in_Ma(val):
	# seconds in 1 Ma
	# result = val / (60 * 60 * 24 * 365.2425 * 1e6)
	result = val / (60 * 60 * 24 * 365.2425 * 1e6)
	return result


################################################################################
def progress(count, total, status=''):
	bar_len = 60
	filled_len = int(round(bar_len * count / float(total)))

	percents = round(100.0 * count / float(total), 1)
	bar = '=' * filled_len + '-' * (bar_len - filled_len)

	sys.stdout.write('[%s] %s%s ...%s\r' % (bar, percents, '%', status))
	sys.stdout.flush()


################################################################################
def frange(start, stop, step):
	i = start
	while i<stop:
		yield i
		i += step
